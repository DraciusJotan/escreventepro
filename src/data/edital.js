// Conteúdo programático do concurso de Escrevente Técnico Judiciário do TJSP (VUNESP).
//
// Fonte: Edital de Abertura nº 02/2026 (publicado em 19/10/2026), conforme resumos publicados por
// cursos preparatórios. Os números de artigos abaixo foram conferidos no resumo do edital de 2025,
// que tem a mesma estrutura: o edital de 2026 remete aos conteúdos específicos ao Anexo VIII.
// CONFIRA OS ARTIGOS NO EDITAL OFICIAL (site da Fundação VUNESP) antes de estudar em cima deles.

export const PROVA = {
  cargo: 'Escrevente Técnico Judiciário',
  orgao: 'TJSP (interior e litoral)',
  banca: 'Fundação VUNESP',
  edital: 'Edital nº 02/2026',
  inscricoesFim: '2026-12-10',
  data: '2027-03-14',
  questoes: 70,
  redacao: { minimo: 24, maximo: 40 },
}

// Blocos da prova objetiva. Português e Direito são eliminatórios: é preciso acertar 50% de cada um,
// além de nota final mínima 5 (de 0 a 10) no conjunto.
export const BLOCOS = [
  { id: 'I', nome: 'Língua Portuguesa', eliminatorio: true, materias: { 'Língua Portuguesa': 16 } },
  {
    id: 'II',
    nome: 'Conhecimentos em Direito',
    eliminatorio: true,
    // O edital dá só o total (30). A divisão por matéria abaixo é uma ESTIMATIVA para o simulado.
    materias: {
      'Direito Penal': 5,
      'Direito Processual Penal': 5,
      'Direito Processual Civil': 6,
      'Direito Constitucional': 5,
      'Direito Administrativo': 5,
      'Normas da Corregedoria': 4,
    },
  },
  {
    id: 'III',
    nome: 'Conhecimentos Gerais',
    eliminatorio: false,
    materias: { Atualidades: 4, Matemática: 4, Informática: 9, 'Raciocínio Lógico': 7 },
  },
]

// Plano do simulado no modelo do edital: [{ materia, quantidade, bloco }] na ordem da prova
export const PLANO_SIMULADO = BLOCOS.flatMap((b) =>
  Object.entries(b.materias).map(([materia, quantidade]) => ({ materia, quantidade, bloco: b.id })),
)

export const blocoDaMateria = (nome) => BLOCOS.find((b) => nome in b.materias) ?? null

// `short` é o rótulo curto usado para agrupar as aulas; `title` é como aparece no checklist.
export const EDITAL = [
  {
    materia: 'Língua Portuguesa',
    topicos: [
      { key: 'lp-interpretacao', short: 'Interpretação de texto', title: 'Compreensão e interpretação de textos', detail: 'Textos verbais, não verbais, literários e não literários; informações literais e inferências; ponto de vista do autor.' },
      { key: 'lp-coesao', short: 'Coesão textual', title: 'Estruturação do texto: relações entre ideias e coesão' },
      { key: 'lp-significacao', short: 'Significação de palavras', title: 'Significação contextual de palavras e expressões', detail: 'Sinônimos e antônimos; sentido próprio e figurado.' },
      { key: 'lp-classes', short: 'Classes de palavras', title: 'Classes de palavras', detail: 'Substantivo, adjetivo, artigo, numeral, pronome, verbo, advérbio, preposição e conjunção.' },
      { key: 'lp-concordancia', short: 'Concordância verbal e nominal', title: 'Concordância verbal e nominal' },
      { key: 'lp-regencia', short: 'Regência verbal e nominal', title: 'Regência verbal e nominal' },
      { key: 'lp-colocacao', short: 'Colocação pronominal', title: 'Colocação pronominal' },
      { key: 'lp-crase', short: 'Crase', title: 'Crase' },
      { key: 'lp-pontuacao', short: 'Pontuação', title: 'Pontuação' },
    ],
  },
  {
    materia: 'Direito Penal',
    topicos: [
      { key: 'pen-falsidade', short: 'Falsidades', title: 'Crimes contra a fé pública: falsificações e falsidades', detail: 'Código Penal, arts. 293 a 305, 307, 308 e 311-A.' },
      { key: 'pen-adm-publica', short: 'Crimes contra a administração pública', title: 'Crimes contra a Administração Pública', detail: 'Código Penal, arts. 312 a 317, 319 a 333, 336 e 337.' },
      { key: 'pen-adm-justica', short: 'Crimes contra a administração da justiça', title: 'Crimes contra a administração da justiça', detail: 'Código Penal, arts. 339 a 347, 357 e 359.' },
    ],
  },
  {
    materia: 'Direito Processual Penal',
    topicos: [
      { key: 'ppe-sujeitos', short: 'Juiz, MP, defesa e auxiliares', title: 'Juiz, Ministério Público, defensor e auxiliares da justiça', detail: 'CPP, arts. 251 a 258, 261 a 267 e 274.' },
      { key: 'ppe-comunicacao', short: 'Citação e intimação', title: 'Citações, intimações e notificações', detail: 'CPP, arts. 351 a 372.' },
      { key: 'ppe-procedimentos', short: 'Processo e procedimentos', title: 'Processo e procedimentos', detail: 'CPP, arts. 394 a 497, 531 a 538 e 541 a 548.' },
      { key: 'ppe-recursos', short: 'Recursos', title: 'Recursos', detail: 'CPP, arts. 574 a 667.' },
      { key: 'ppe-jecrim', short: 'Juizado Especial Criminal', title: 'Juizados Especiais Criminais', detail: 'Lei 9.099/1995, arts. 60 a 83, 88 e 89.' },
    ],
  },
  {
    materia: 'Direito Processual Civil',
    topicos: [
      { key: 'pc-juiz', short: 'Juiz e auxiliares', title: 'Juiz e auxiliares da justiça', detail: 'CPC, arts. 144 a 155.' },
      { key: 'pc-atos', short: 'Atos processuais e prazos', title: 'Atos processuais, prazos e comunicação dos atos', detail: 'CPC, arts. 188 a 275.' },
      { key: 'pc-tutela', short: 'Tutela provisória', title: 'Tutela provisória', detail: 'CPC, arts. 294 a 311.' },
      { key: 'pc-procedimento', short: 'Procedimento comum e cumprimento', title: 'Procedimento comum, sentença e cumprimento de sentença', detail: 'CPC, arts. 318 a 538.' },
      { key: 'pc-recursos', short: 'Recursos', title: 'Recursos', detail: 'CPC, arts. 994 a 1026.' },
      { key: 'pc-juizados', short: 'Juizados Especiais Cíveis', title: 'Juizados Especiais Cíveis', detail: 'Lei 9.099/1995, arts. 3º a 19.' },
      { key: 'pc-fazenda', short: 'Juizados da Fazenda Pública', title: 'Juizados Especiais da Fazenda Pública', detail: 'Lei 12.153/2009.' },
    ],
  },
  {
    materia: 'Direito Constitucional',
    topicos: [
      { key: 'cf-direitos', short: 'Direitos e garantias fundamentais', title: 'Direitos e deveres individuais e coletivos', detail: 'CF, Título II, Capítulo I (art. 5º).' },
      { key: 'cf-sociais', short: 'Direitos sociais', title: 'Direitos sociais', detail: 'CF, Título II, Capítulo II (arts. 6º a 11).' },
      { key: 'cf-nacionalidade', short: 'Nacionalidade', title: 'Nacionalidade', detail: 'CF, Título II, Capítulo III (arts. 12 e 13).' },
      { key: 'cf-adm-publica', short: 'Administração Pública e servidores', title: 'Administração Pública: disposições gerais e servidores públicos', detail: 'CF, Título III, Capítulo VII, Seções I e II.' },
      { key: 'cf-art92', short: 'Órgãos do Poder Judiciário', title: 'Órgãos do Poder Judiciário', detail: 'CF, art. 92.' },
    ],
  },
  {
    materia: 'Direito Administrativo',
    topicos: [
      { key: 'adm-estatuto', short: 'Estatuto dos Funcionários (Lei 10.261/68)', title: 'Estatuto dos Funcionários Públicos Civis do Estado de São Paulo', detail: 'Lei 10.261/1968, arts. 1º a 86, 171 a 175 e 239 a 323.' },
      { key: 'adm-improbidade', short: 'Improbidade administrativa', title: 'Lei de Improbidade Administrativa', detail: 'Lei 8.429/1992.' },
    ],
  },
  {
    materia: 'Normas da Corregedoria',
    // Aqui entra toda a "Legislação Interna" do edital
    topicos: [
      { key: 'li-teletrabalho', short: 'Teletrabalho (Res. 850/2021)', title: 'Resolução TJSP nº 850/2021: teletrabalho' },
      { key: 'li-eproc', short: 'eproc (Res. 963/2025)', title: 'Resolução TJSP nº 963/2025: sistema eproc' },
      { key: 'li-lc1111', short: 'Plano de Cargos (LC 1.111/2010)', title: 'Lei Complementar nº 1.111/2010: Plano de Cargos e Carreiras do TJSP' },
      { key: 'li-regimento', short: 'Regimento Interno', title: 'Regimento Interno do TJSP' },
      { key: 'li-ncgj', short: 'Normas da Corregedoria', title: 'Normas da Corregedoria Geral da Justiça', detail: 'Tomo I: capítulos e seções indicados no edital.' },
    ],
  },
  {
    materia: 'Atualidades',
    topicos: [
      { key: 'at-fatos', short: 'Fatos atuais', title: 'Fatos políticos, econômicos, sociais e culturais, nacionais e internacionais', detail: 'A partir do 1º semestre de 2026. Muda a cada edital: não há aula fixa.' },
      { key: 'at-pcd', short: 'Estatuto da Pessoa com Deficiência', title: 'Estatuto da Pessoa com Deficiência', detail: 'Lei 13.146/2015, com as alterações vigentes.' },
    ],
  },
  {
    materia: 'Matemática',
    topicos: [
      { key: 'mat-numeros', short: 'Números reais, MMC e MDC', title: 'Operações com números reais; MMC e MDC' },
      { key: 'mat-razao', short: 'Razão, proporção e regra de três', title: 'Razão, proporção e regra de três (simples e composta)' },
      { key: 'mat-porcentagem', short: 'Porcentagem', title: 'Porcentagem' },
      { key: 'mat-medias', short: 'Médias', title: 'Médias aritmética simples e ponderada' },
      { key: 'mat-juros', short: 'Juros simples', title: 'Juros simples' },
      { key: 'mat-equacoes', short: 'Equações e sistemas', title: 'Equações do 1º e 2º graus; sistemas do 1º grau' },
      { key: 'mat-grandezas', short: 'Grandezas, tabelas, gráficos e medidas', title: 'Relação entre grandezas (tabelas e gráficos) e sistemas de medidas usuais' },
      { key: 'mat-geometria', short: 'Noções de geometria', title: 'Noções de geometria', detail: 'Forma, perímetro, área, volume, ângulo e teorema de Pitágoras.' },
    ],
  },
  {
    materia: 'Informática',
    topicos: [
      { key: 'inf-windows', short: 'Windows', title: 'MS-Windows 10 ou superior' },
      { key: 'inf-word', short: 'Word', title: 'MS-Word' },
      { key: 'inf-excel', short: 'Excel', title: 'MS-Excel' },
      { key: 'inf-email', short: 'Correio eletrônico', title: 'Correio eletrônico' },
      { key: 'inf-internet', short: 'Internet', title: 'Internet: navegação, URL, links, sites, busca e impressão de páginas' },
      { key: 'inf-teams', short: 'Microsoft Teams', title: 'MS Teams' },
      { key: 'inf-onedrive', short: 'OneDrive', title: 'OneDrive: armazenamento e compartilhamento de arquivos' },
    ],
  },
  {
    materia: 'Raciocínio Lógico',
    topicos: [
      { key: 'rl-estruturas', short: 'Estruturas lógicas', title: 'Estruturas lógicas, argumentação e diagramas', detail: 'Proposições, negação, equivalência e condicionais.' },
      { key: 'rl-relacoes', short: 'Relações arbitrárias', title: 'Relações arbitrárias entre pessoas, lugares, coisas e eventos', detail: 'Associação lógica: deduzir novas informações a partir das relações dadas.' },
      { key: 'rl-sequencias', short: 'Sequências', title: 'Regularidades de sequências numéricas e figurais' },
    ],
  },
]

export const TODOS_TOPICOS = EDITAL.flatMap((m) => m.topicos.map((t) => ({ ...t, materia: m.materia })))
export const topicoPorChave = new Map(TODOS_TOPICOS.map((t) => [t.key, t]))
