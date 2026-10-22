// O GitHub Pages não sabe que /revisao ou /questoes são rotas do React:
// para qualquer endereço desconhecido ele serve o 404.html.
// Copiando o index.html para 404.html, o app carrega e o React Router assume a rota.
import fs from 'node:fs'

fs.copyFileSync('dist/index.html', 'dist/404.html')
console.log('dist/404.html criado (fallback de rotas para o GitHub Pages)')
