// Leitura e validação da planilha de importação (CSV ou XLSX).
// Colunas do modelo: materia, assunto, enunciado, alternativa_a..e, gabarito, fonte

export const TEMPLATE_COLUMNS = [
  'materia',
  'assunto',
  'enunciado',
  'alternativa_a',
  'alternativa_b',
  'alternativa_c',
  'alternativa_d',
  'alternativa_e',
  'gabarito',
  'fonte',
]

const ALIASES = {
  a: 'alternativa_a',
  b: 'alternativa_b',
  c: 'alternativa_c',
  d: 'alternativa_d',
  e: 'alternativa_e',
  questao: 'enunciado',
  resposta: 'gabarito',
  disciplina: 'materia',
}

// "Matéria", "ALTERNATIVA A" e "alternativa_a" viram todos a mesma chave.
export const normalize = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

const headerKey = (h) => {
  const k = normalize(h).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  return ALIASES[k] ?? k
}

// Parser de CSV próprio: o Excel brasileiro salva com ponto e vírgula,
// e enunciados têm vírgulas, aspas e quebras de linha.
export function parseCSV(text) {
  text = text.replace(/^﻿/, '')
  const firstLine = text.split(/\r?\n/, 1)[0]
  const count = (ch) => firstLine.split(ch).length - 1
  const delimiter = [',', ';', '\t'].sort((x, y) => count(y) - count(x))[0]

  const rows = []
  let row = []
  let cell = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') {
        quoted = false
      } else {
        cell += ch
      }
    } else if (ch === '"') {
      quoted = true
    } else if (ch === delimiter) {
      row.push(cell)
      cell = ''
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else {
      cell += ch
    }
  }
  if (cell !== '' || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

// Lê o arquivo e devolve uma matriz de linhas (a primeira é o cabeçalho).
export async function readFileMatrix(file) {
  const name = file.name.toLowerCase()
  if (name.endsWith('.csv') || name.endsWith('.txt')) {
    return parseCSV(await file.text())
  }
  if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
    // Carregado sob demanda: a biblioteca é grande e só esta tela usa.
    const XLSX = await import('xlsx')
    const workbook = XLSX.read(await file.arrayBuffer())
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '', raw: false })
  }
  throw new Error('Formato não suportado. Envie um arquivo .xlsx ou .csv.')
}

// Valida cada linha. Retorna as questões prontas para inserir e a lista de erros por linha.
export function validateMatrix(matrix, subjects) {
  const errors = []
  const valid = []

  if (!matrix.length) return { valid, errors: [{ line: 1, message: 'Arquivo vazio.' }], total: 0 }

  const headers = matrix[0].map(headerKey)
  const missing = TEMPLATE_COLUMNS.filter((c) => c !== 'assunto' && c !== 'fonte' && !headers.includes(c))
  if (missing.length) {
    return {
      valid,
      errors: [{ line: 1, message: `Colunas ausentes no cabeçalho: ${missing.join(', ')}. Use o modelo.` }],
      total: 0,
    }
  }

  const subjectByName = new Map(subjects.map((s) => [normalize(s.name), s]))
  let total = 0

  matrix.slice(1).forEach((cells, i) => {
    const line = i + 2 // linha 1 é o cabeçalho
    const rec = {}
    headers.forEach((h, idx) => {
      rec[h] = String(cells[idx] ?? '').trim()
    })
    if (Object.values(rec).every((v) => v === '')) return // linha em branco
    total++

    const problems = []
    const subject = subjectByName.get(normalize(rec.materia))
    if (!rec.materia) problems.push('matéria vazia')
    else if (!subject) problems.push(`matéria "${rec.materia}" não existe (crie em Matérias ou corrija o nome)`)
    if (!rec.enunciado) problems.push('enunciado vazio')
    for (const l of ['a', 'b', 'c', 'd', 'e']) {
      if (!rec[`alternativa_${l}`]) problems.push(`alternativa ${l.toUpperCase()} vazia`)
    }
    const gabarito = rec.gabarito.toUpperCase()
    if (!['A', 'B', 'C', 'D', 'E'].includes(gabarito)) problems.push('gabarito deve ser A, B, C, D ou E')

    if (problems.length) {
      errors.push({ line, message: problems.join('; ') })
      return
    }
    valid.push({
      subject_id: subject.id,
      topic: rec.assunto || null,
      statement: rec.enunciado,
      option_a: rec.alternativa_a,
      option_b: rec.alternativa_b,
      option_c: rec.alternativa_c,
      option_d: rec.alternativa_d,
      option_e: rec.alternativa_e,
      correct_option: gabarito,
      source: rec.fonte || null,
    })
  })

  return { valid, errors, total }
}
