# Montando seu banco de questões

## O que existe (e o que não existe)

Não há um dataset aberto (CSV/JSON com licença livre) de questões da VUNESP ou do TJSP. Os bancos grandes (Qconcursos, TecConcursos, Estratégia) são pagos e fechados, e copiar o conteúdo deles viola os termos de uso.

O caminho gratuito e legítimo é usar as **provas anteriores em PDF**, que são divulgadas publicamente:

- **Site da Fundação VUNESP** (vunesp.com.br): na área de concursos encerrados do TJSP ficam o caderno de questões e o gabarito definitivo de cada edição.
- **Estude Grátis** (estudegratis.com.br): acervo de terceiros com provas antigas da VUNESP e do TJ-SP, com gabarito para download gratuito.

Edições do cargo de Escrevente: 2011, 2012, 2013, 2017, 2018, 2021, 2023, 2024 e 2025, entre outras. Os gabaritos mudam depois dos recursos: use sempre o **definitivo**.

## Como converter uma prova em questões do app

1. Baixe o PDF da prova e anote o gabarito definitivo (um `.txt` com `1-A 2-B ...` ou só as letras em sequência).
2. Veja em que número cada matéria começa e termina na prova.
3. Rode:

```bash
node scripts/pdf-to-csv.mjs prova.pdf \
  --gabarito gabarito.txt \
  --blocos "1-20=Língua Portuguesa;21-40=Direito Constitucional;41-60=Direito Administrativo" \
  --fonte "VUNESP · TJSP 2023" \
  --out prova-2023.csv
```

Os nomes em `--blocos` precisam ser iguais aos das suas matérias no app. Prova de uma matéria só: use `--materia "Matemática"`.

4. Abra o CSV e confira algumas questões. A coluna `assunto` fica vazia para você preencher (opcional).
5. No app: **Questões → Importar** e envie o CSV. A prévia mostra os erros antes de salvar.

### O que a ferramenta resolve

- Provas em duas colunas, cabeçalhos e rodapés repetidos, palavras hifenizadas na quebra de linha.
- Texto-base compartilhado ("Leia o texto para responder às questões de 01 a 05"): o texto é anexado ao enunciado de cada questão do intervalo.
- Títulos de seção ("MATEMÁTICA") que grudariam na última alternativa.

### O que ela não resolve

Questões com **figura, tabela ou fórmula** perdem o conteúdo visual, e **questões anuladas** não têm gabarito. Essas ficam listadas no relatório ("Não exportadas") para você cadastrar à mão se valer a pena. PDFs escaneados (imagem) precisam de OCR antes.

## Direitos autorais

As questões pertencem à banca. Uso pessoal para estudo é o esperado, mas **não publique as questões no repositório do GitHub** (portfólio público). Elas ficam só no seu banco no Supabase, que é privado por usuário. Os `.csv`/`.pdf` gerados já estão no `.gitignore`.

## Outras fontes

- **Você mesmo + IA (fase 2):** cole o texto da lei seca e o Claude gera questões no estilo VUNESP para você revisar. Serve para cobrir lacunas onde faltam questões reais.
- **Erros dos simulados:** cadastre à mão as questões que você errou em cursos e apostilas que você já possui.
