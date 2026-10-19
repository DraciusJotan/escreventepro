// Verificação rápida do parser de importação: node scripts/parse-check.mjs
import fs from 'node:fs'
import assert from 'node:assert/strict'
import * as XLSX from 'xlsx'
import { parseCSV, validateMatrix } from '../src/lib/importQuestions.js'

const subjects = [
  { id: 'S1', name: 'Língua Portuguesa' },
  { id: 'S2', name: 'Matemática' },
]

// Modelo CSV (BOM, ponto e vírgula, aspas)
const csv = validateMatrix(parseCSV(fs.readFileSync('public/modelo-questoes.csv', 'utf8')), subjects)
assert.equal(csv.valid.length, 2)
assert.equal(csv.errors.length, 0)

// Modelo XLSX
const wb = XLSX.read(fs.readFileSync('public/modelo-questoes.xlsx'))
const matrix = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '', raw: false })
const xlsx = validateMatrix(matrix, subjects)
assert.equal(xlsx.valid.length, 2)
assert.equal(xlsx.valid[0].subject_id, 'S1')

// Casos ruins, quebra de linha e vírgula dentro de aspas, linha em branco
const bad = validateMatrix(
  parseCSV(
    'Matéria,Assunto,Enunciado,A,B,C,D,E,Gabarito\n"Matemática",x,"linha1\nlinha2, com ""aspas""",1,2,3,4,5,b\nFisica,,q,1,2,3,4,5,A\nMatemática,,q,1,2,,4,5,Z\n,,,,,,,,\n',
  ),
  subjects,
)
assert.equal(bad.valid.length, 1)
assert.equal(bad.valid[0].statement, 'linha1\nlinha2, com "aspas"')
assert.equal(bad.valid[0].correct_option, 'B')
assert.equal(bad.errors.length, 2)
assert.equal(bad.errors[0].line, 3)

// Cabeçalho errado
assert.match(validateMatrix(parseCSV('foo,bar\n1,2'), subjects).errors[0].message, /Colunas ausentes/)

console.log('parser OK')
