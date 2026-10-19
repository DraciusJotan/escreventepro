// Converte o PDF de uma prova (ex.: VUNESP) + gabarito em CSV no formato de importação do app.
//
// Uso:
//   node scripts/pdf-to-csv.mjs prova.pdf --gabarito gabarito.txt \
//        --blocos "1-20=Língua Portuguesa;21-40=Direito Constitucional" \
//        --fonte "VUNESP · TJSP 2023" --out prova.csv
//
// Opções:
//   --gabarito   arquivo .txt com o gabarito ("1-A 2-B ..." ou só as letras em sequência) ou a própria string
//   --blocos     faixa de questões => matéria (nomes iguais aos das suas matérias no app)
//   --materia    use no lugar de --blocos quando a prova inteira é de uma matéria
//   --fonte      texto da coluna "fonte"
//   --colunas    1, 2 ou auto (padrão): colunas de texto do PDF
//   --inicio     número da primeira questão (padrão 1)
//   --out        arquivo de saída (padrão: <prova>.csv)
//
// Questões incompletas (sem as 5 alternativas, sem gabarito, anuladas ou com figura)
// não entram no CSV: ficam listadas no relatório para você cadastrar à mão.
import fs from 'node:fs'
import path from 'node:path'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { TEMPLATE_COLUMNS } from '../src/lib/importQuestions.js'
import { parseBlocks, parseGabarito, parseProva } from './lib/provaParser.mjs'

function parseArgs(argv) {
  const args = { _: [] }
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[++i]
    else args._.push(argv[i])
  }
  return args
}

// Lê o PDF e devolve as linhas de texto na ordem de leitura.
async function extractLines(file, columnsMode) {
  const pdf = await getDocument({ data: new Uint8Array(fs.readFileSync(file)), useSystemFonts: true }).promise
  const pages = []

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p)
    const { width } = page.getViewport({ scale: 1 })
    const { items } = await page.getTextContent()
    const words = items
      .filter((it) => it.str.trim())
      .map((it) => ({ text: it.str, x: it.transform[4], y: it.transform[5] }))

    // agrupa palavras em linhas (mesma altura, com tolerância)
    const rows = []
    for (const w of words.sort((a, b) => b.y - a.y || a.x - b.x)) {
      const row = rows.find((r) => Math.abs(r.y - w.y) < 3)
      if (row) row.words.push(w)
      else rows.push({ y: w.y, words: [w] })
    }

    const toLine = (row) => ({
      y: row.y,
      x: Math.min(...row.words.map((w) => w.x)),
      text: row.words.sort((a, b) => a.x - b.x).map((w) => w.text).join(' ').replace(/\s+/g, ' ').trim(),
    })

    // Duas colunas: palavras sozinhas de cada lado do meio da página.
    const cols = Number(columnsMode) || (words.filter((w) => w.x > width * 0.5).length > words.length * 0.25 ? 2 : 1)
    let lines
    if (cols === 2) {
      const mid = width / 2
      const side = (pred) =>
        words.filter(pred).sort((a, b) => b.y - a.y || a.x - b.x)
      const build = (ws) => {
        const rs = []
        for (const w of ws) {
          const r = rs.find((x) => Math.abs(x.y - w.y) < 3)
          if (r) r.words.push(w)
          else rs.push({ y: w.y, words: [w] })
        }
        return rs.map(toLine)
      }
      lines = [...build(side((w) => w.x < mid)), ...build(side((w) => w.x >= mid))]
    } else {
      lines = rows.map(toLine)
    }
    pages.push(lines.map((l) => l.text))
  }

  // remove cabeçalhos/rodapés: linhas que se repetem em metade ou mais das páginas
  if (pages.length > 2) {
    const freq = new Map()
    for (const page of pages) for (const t of new Set(page)) freq.set(t, (freq.get(t) ?? 0) + 1)
    const noise = new Set([...freq].filter(([, c]) => c >= pages.length * 0.5).map(([t]) => t))
    return pages.flatMap((page) => page.filter((t) => !noise.has(t) && !/^\d{1,3}$/.test(t) && !/^página\s+\d+/i.test(t)))
  }
  return pages.flat()
}

const esc = (v) => (/[;"\n\r]/.test(v) ? `"${String(v).replaceAll('"', '""')}"` : v)

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const pdfFile = args._[0]
  if (!pdfFile || (!args.blocos && !args.materia) || !args.gabarito) {
    console.error('Uso: node scripts/pdf-to-csv.mjs prova.pdf --gabarito gab.txt (--blocos "1-20=Matéria;..." | --materia "Matéria") [--fonte "..."] [--out saida.csv]')
    process.exit(1)
  }

  const subjectOf = args.blocos ? parseBlocks(args.blocos) : () => args.materia
  const gabText = fs.existsSync(args.gabarito) ? fs.readFileSync(args.gabarito, 'utf8') : args.gabarito
  const gabarito = parseGabarito(gabText)

  const lines = await extractLines(pdfFile, args.colunas ?? 'auto')
  const questions = parseProva(lines, { start: Number(args.inicio ?? 1) })

  const rows = []
  const skipped = []
  for (const q of questions) {
    const letters = Object.keys(q.options)
    const answer = gabarito.get(q.n)
    const subject = subjectOf(q.n)
    if (letters.length !== 5) skipped.push(`${q.n}: só ${letters.length} alternativas detectadas (figura ou layout diferente)`)
    else if (!answer || !'ABCDE'.includes(answer)) skipped.push(`${q.n}: sem gabarito válido (${answer ?? 'ausente'}; anulada?)`)
    else if (!subject) skipped.push(`${q.n}: nenhuma matéria definida para este número em --blocos`)
    else {
      rows.push([subject, '', q.statement, q.options.A, q.options.B, q.options.C, q.options.D, q.options.E, answer, args.fonte ?? ''])
    }
  }

  const out = args.out ?? pdfFile.replace(/\.pdf$/i, '') + '.csv'
  const csv = [TEMPLATE_COLUMNS, ...rows].map((r) => r.map(esc).join(';')).join('\r\n')
  fs.writeFileSync(out, '﻿' + csv + '\r\n', 'utf8')

  console.log(`${path.basename(pdfFile)}: ${questions.length} questões detectadas, ${rows.length} exportadas -> ${out}`)
  if (skipped.length) {
    console.log(`\nNão exportadas (${skipped.length}), cadastre à mão se quiser:`)
    skipped.forEach((s) => console.log('  -', s))
  }
  console.log('\nDica: abra o CSV e confira algumas questões antes de importar. A coluna "assunto" fica vazia para você preencher.')
}

main().catch((e) => {
  console.error('Erro:', e.message)
  process.exit(1)
})
