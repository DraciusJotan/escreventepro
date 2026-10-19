// Gera public/modelo-questoes.xlsx e .csv. Rode com: node scripts/gen-template.mjs
import fs from 'node:fs'
import * as XLSX from 'xlsx'
import { TEMPLATE_COLUMNS } from '../src/lib/importQuestions.js'

const examples = [
  [
    'Língua Portuguesa',
    'Crase',
    'Assinale a alternativa em que o uso do sinal indicativo de crase está correto.',
    'Referiu-se à pessoas muito educadas.',
    'Chegamos à Brasília ao amanhecer.',
    'Entregou o documento à secretária.',
    'Começou a trabalhar à partir de segunda.',
    'Ficou face à face com o diretor.',
    'C',
    'EXEMPLO (apague esta linha)',
  ],
  [
    'Matemática',
    'Porcentagem',
    'Um produto que custava R$ 200,00 teve aumento de 10%. Qual é o novo preço?',
    'R$ 210,00',
    'R$ 215,00',
    'R$ 220,00',
    'R$ 225,00',
    'R$ 230,00',
    'C',
    'EXEMPLO (apague esta linha)',
  ],
]

const instructions = [
  ['Como preencher'],
  ['1. Use a aba "Questões". A primeira linha é o cabeçalho: não mude os nomes das colunas.'],
  ['2. materia: o nome exatamente como aparece em Matérias no app (maiúsculas e acentos não importam).'],
  ['3. gabarito: uma letra, A, B, C, D ou E.'],
  ['4. assunto e fonte são opcionais. Todas as outras colunas são obrigatórias.'],
  ['5. Apague as linhas de exemplo antes de importar (ou importe e exclua depois).'],
  ['6. Pode salvar como .xlsx ou como .csv (separado por vírgula ou ponto e vírgula).'],
]

const wb = XLSX.utils.book_new()
const sheet = XLSX.utils.aoa_to_sheet([TEMPLATE_COLUMNS, ...examples])
sheet['!cols'] = TEMPLATE_COLUMNS.map((c) => ({ wch: c === 'enunciado' ? 60 : c.startsWith('alternativa') ? 32 : 20 }))
XLSX.utils.book_append_sheet(wb, sheet, 'Questões')
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(instructions), 'Instruções')
fs.mkdirSync('public', { recursive: true })
fs.writeFileSync('public/modelo-questoes.xlsx', XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }))

// CSV com BOM e ponto e vírgula: é o que o Excel em português abre sem bagunçar acentos.
const esc = (v) => (/[;"\n]/.test(v) ? `"${v.replaceAll('"', '""')}"` : v)
const csv = [TEMPLATE_COLUMNS, ...examples].map((r) => r.map(esc).join(';')).join('\r\n')
fs.writeFileSync('public/modelo-questoes.csv', '﻿' + csv + '\r\n', 'utf8')
console.log('Modelos gerados em public/')
