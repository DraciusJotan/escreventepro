// Converte as linhas de texto de um caderno de prova (estilo VUNESP) em questões.
// Funções puras: não leem arquivos, para poderem ser testadas.

const QUESTION_HEADER = /^QUEST[ÃA]O\s+(\d{1,3})\b[\s.:)\-–]*(.*)$/i
const QUESTION_NUMBERED = /^(\d{1,3})\s*[.)\-–]\s+(\S.*)$/
const OPTION = /^\(?([A-E])\)\s*(.*)$/
// "Leia o texto para responder às questões de números 01 a 05."
const PASSAGE_RANGE = /quest(?:ões|oes|ão|ao)\s+(?:de\s+)?(?:n[úu]meros?\s+)?(\d{1,3})\s*(?:a|à|até|e|-|–)\s*(\d{1,3})/i

const join = (current, line) => {
  if (!current) return line
  // "pala-" + "vra" -> "palavra" (hifenização de fim de linha)
  if (/[a-zà-ú]-$/i.test(current) && /^[a-zà-ú]/.test(line)) return current.slice(0, -1) + line
  return `${current} ${line}`
}

export function parseProva(lines, { start = 1 } = {}) {
  const questions = []
  const passages = [] // { from, to, text }
  let expected = start
  let current = null // questão em montagem
  let part = null // 'statement' ou letra da alternativa
  let passage = null // texto-base em montagem

  const closePassage = () => {
    if (passage) passages.push(passage)
    passage = null
  }

  const clean = lines.map((l) => l.trim()).filter(Boolean)
  const PASSAGE_CUE = /\b(leia|considere|observe|analise|texto)\b/i

  for (let i = 0; i < clean.length; i++) {
    let line = clean[i]

    let n = null
    let rest = ''
    const header = line.match(QUESTION_HEADER)
    const numbered = !header && line.match(QUESTION_NUMBERED)
    if (header) [, n, rest] = header
    else if (numbered) [, n, rest] = numbered
    n = n === null ? null : Number(n)

    if (n === expected) {
      closePassage()
      current = { n, statement: rest, options: {}, }
      questions.push(current)
      part = 'statement'
      expected++
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
      passage.text = join(passage.text, line)
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
      current.statement = join(current.statement, line)
    } else if (part) {
      current.options[part] = join(current.options[part], line)
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
