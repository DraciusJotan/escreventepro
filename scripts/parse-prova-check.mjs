// Verificação do parser de provas: node scripts/parse-prova-check.mjs
import assert from 'node:assert/strict'
import { parseBlocks, parseGabarito, parseProva } from './lib/provaParser.mjs'

const lines = [
  'LÍNGUA PORTUGUESA',
  'Leia o texto para responder às questões de números 01',
  'a 02.',
  'A lei-',
  'tura amplia o vocabulário.',
  'QUESTÃO 01',
  'Segundo o texto, a leitura',
  'serve para',
  '(A) reduzir.',
  '(B) ampliar o',
  'vocabulário.',
  '(C) c', '(D) d', '(E) e',
  '2. Outra questão',
  'A) a', 'B) b', 'C) c', 'D) d', 'E) e',
  'MATEMÁTICA',
  '03. Quanto é 2 + 2?',
  '(A) 1', '(B) 2', '(C) 3', '(D) 4', '(E) 5',
  'MATEMÁTICA',
]

const qs = parseProva(lines)
assert.equal(qs.length, 3)
assert.match(qs[0].statement, /^Leia o texto.*02\. A leitura amplia/s)
assert.match(qs[0].statement, /serve para$/)
assert.equal(qs[0].options.B, 'ampliar o vocabulário.')
assert.equal(qs[1].options.A, 'a')
assert.equal(qs[2].options.E, '5')
assert.equal(Object.keys(qs[2]?.options).length, 5)

const g1 = parseGabarito('1-A 2-B 3-C 4-D 5-E 6-X')
assert.equal(g1.get(6), 'X')
assert.equal(parseGabarito('ABCDE').get(4), 'D')
assert.equal(parseGabarito('01 C  02 D  03 A  04 B  05 E').get(1), 'C')

const subject = parseBlocks('1-20=Língua Portuguesa;21-40=Matemática')
assert.equal(subject(20), 'Língua Portuguesa')
assert.equal(subject(21), 'Matemática')
assert.equal(subject(99), '')

console.log('parser de provas OK')
