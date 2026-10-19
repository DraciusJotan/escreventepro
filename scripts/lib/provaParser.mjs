// Converte as linhas de texto de um caderno de prova (estilo VUNESP) em questões.
// Funções puras: não leem arquivos, para poderem ser testadas.

const QUESTION_HEADER = /^QUEST[ÃA]O\s+(\d{1,3})\b[\s.:)\-–]*(.*)$/i
const QUESTION_NUMBERED = /^(\d{1,3})\s*[.)\-–]\s+(\S.*)$/
const OPTION = /^\(?([A-E])\)\s*(.*)$/
// "Leia o texto para responder às questões de números 01 a 05."
const PASSAGE_RANGE = /quest(?:ões|oes|ão|ao)\s+(?:de\s+)?(?:n[úu]meros?\s+)?(\d{1,3})\s*(?:a|à|até|e|-|–)\s*(\d{1,3})/i

// Palavras inteiras do próprio PDF (tokens que não estão nas pontas das linhas).
// Servem para religar "obri" + "gatório" quando o PDF perdeu o hífen de fim de linha.
function buildVocab(lines) {
  const vocab = new Set()
  const add = (t) => {
    const w = t.toLowerCase().replace(/^[^\p{L}]+|[^\p{L}]+$/gu, '')
    if (w.length >= 3 && /^\p{L}+$/u.test(w)) vocab.add(w)
  }
  for (const l of lines) {
    const tokens = l.split(/\s+/)
    tokens.slice(1, -1).forEach(add)
    // pontas de linha só entram quando há pontuação colada: aí a palavra está inteira
    if (/[.,;:?!)”"]$/.test(l)) add(tokens.at(-1))
    if (/^[“"(]/.test(l)) add(tokens[0])
  }
  return vocab
}

const join = (current, line, vocab) => {
  if (!current) return line
  // "pala-" + "vra" -> "palavra" (hifenização de fim de linha)
  if (/[a-zà-ú]\s?-$/i.test(current) && /^[a-zà-ú]/.test(line)) return current.replace(/\s?-$/, '') + line
  // hífen perdido no PDF: "obri" + "gatório" -> "obrigatório" (só se a palavra inteira existe no texto)
  const last = current.match(/(\p{L}+)$/u)?.[1]
  const first = line.match(/^(\p{L}+)/u)?.[1]
  if (vocab && last && first) {
    const whole = (last + first).toLowerCase()
    if (vocab.has(whole) && !vocab.has(last.toLowerCase())) {
      return current + line
    }
  }
  return `${current} ${line}`
}

export function parseProva(lines, { start = 1 } = {}) {
  const questions = []
  const passages = [] // { from, to, text }
  let expected = start
  const seen = new Set()
  let current = null // questão em montagem
  let part = null // 'statement' ou letra da alternativa
  let passage = null // texto-base em montagem

  const closePassage = () => {
    if (passage) passages.push(passage)
    passage = null
  }

  const clean = lines.map((l) => l.trim()).filter(Boolean)
  const vocab = buildVocab(clean)
  const PASSAGE_CUE = /\b(leia|considere|observe|analise|texto)\b/i

  for (let i = 0; i < clean.length; i++) {
    let line = clean[i]

    let n = null
    let rest = ''
    const header = line.match(QUESTION_HEADER)
    const numbered = !header && line.match(QUESTION_NUMBERED)
    if (header) [, n, rest] = header
    else if (numbered) [, n, rest] = numbered
    // "001. PROVA OBJETIVA" (título da capa) não é a questão 1
    if (n !== null && n.length === 3 && n.startsWith('0')) n = null
    n = n === null ? null : Number(n)

    // Aceita o próximo número esperado ou um número ainda não visto logo à frente/atrás:
    // em PDFs de duas colunas a ordem de leitura às vezes troca questões vizinhas (42 antes de 41).
    const isNew = n !== null && n >= start && !seen.has(n) && n <= expected + 2
    if (isNew) {
      closePassage()
      current = { n, statement: rest, options: {} }
      questions.push(current)
      seen.add(n)
      part = 'statement'
      if (n >= expected) expected = n + 1
      continue
    }

    // A frase "Leia o texto ... questões de 01 a 05" pode quebrar em até 3 linhas no PDF.
    if (PASSAGE_CUE.test(line)) {
      for (let extra = 0; extra < 3; extra++) {
        const candidate = clean.slice(i, i + 1 + extra).join(' ')
        const range = candidate.match(PASSAGE_RANGE)
        if (range) {
          closePassage()
          current = null
          part = null
          passage = { from: Number(range[1]), to: Number(range[2]), text: candidate }
          i += extra
          line = null
          break
        }
      }
      if (line === null) continue
    }

    if (passage) {
      passage.text = join(passage.text, line, vocab)
      continue
    }
    if (!current) continue

    // Título de seção ("MATEMÁTICA", "CONHECIMENTOS GERAIS") encerra a alternativa em andamento.
    if (part && part !== 'statement' && /^[A-ZÀ-Ú\s\-–]{5,}$/.test(line) && !OPTION.test(line)) {
      part = null
      continue
    }

    const opt = line.match(OPTION)
    if (opt && !current.options[opt[1]]) {
      part = opt[1]
      current.options[part] = opt[2]
    } else if (part === 'statement') {
      current.statement = join(current.statement, line, vocab)
    } else if (part) {
      current.options[part] = join(current.options[part], line, vocab)
    }
  }
  closePassage()

  for (const q of questions) {
    const p = passages.find((x) => q.n >= x.from && q.n <= x.to)
    if (p) q.statement = `${p.text}\n\n${q.statement}`.trim()
  }
  return questions
}

// Aceita "1-A 2-B ..." / "01 C" / "1) D" ou só as letras em sequência ("ABCDE...").
export function parseGabarito(text) {
  const map = new Map()
  const pairs = [...text.matchAll(/(\d{1,3})\s*[-–:.)]?\s*([A-E]|X|ANULAD[AO])\b/gi)]
  if (pairs.length >= 5) {
    for (const [, n, letter] of pairs) map.set(Number(n), letter.toUpperCase())
    return map
  }
  const letters = text.toUpperCase().replace(/[^A-EX]/g, '')
  ;[...letters].forEach((l, i) => map.set(i + 1, l))
  return map
}

// "1-20=Língua Portuguesa;21-40=Direito Constitucional" -> função n -> matéria
export function parseBlocks(spec) {
  const blocks = spec
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/^(\d+)\s*-\s*(\d+)\s*=\s*(.+)$/)
      if (!m) throw new Error(`Bloco inválido: "${part}". Use 1-20=Matéria;21-40=Outra.`)
      return { from: Number(m[1]), to: Number(m[2]), subject: m[3].trim() }
    })
  return (n) => blocks.find((b) => n >= b.from && n <= b.to)?.subject ?? ''
}
