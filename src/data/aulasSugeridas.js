// Aulas gratuitas do YouTube sugeridas como ponto de partida, ligadas aos assuntos do edital.
//
// Cada link foi verificado no YouTube (existe, é público e pode ser incorporado) e o canal é o autor do
// vídeo. São conteúdos de terceiros, em sua maioria preparados para provas de 2023 a 2026: a qualidade e a
// atualização variam. Atualidades não tem aula fixa porque muda a cada edital.
// O usuário escolhe adicionar, e depois pode remover ou acrescentar as suas.
import { topicoPorChave } from './edital.js'

const yt = (id) => `https://www.youtube.com/watch?v=${id}`
const pl = (id) => `https://www.youtube.com/playlist?list=${id}`

// L(matéria, chave do edital | null, título, canal, id, [rótulo do assunto quando não há chave])
function L(subject, edital, title, channel, id, topic) {
  const isPlaylist = id.startsWith('pl:')
  const url = isPlaylist ? pl(id.slice(3)) : yt(id)
  return {
    subject,
    edital,
    topic: edital ? topicoPorChave.get(edital).short : topic,
    title,
    channel,
    url,
    kind: isPlaylist ? 'playlist' : 'video',
  }
}

const LP = 'Língua Portuguesa'
const DP = 'Direito Penal'
const DPP = 'Direito Processual Penal'
const DPC = 'Direito Processual Civil'
const DC = 'Direito Constitucional'
const DA = 'Direito Administrativo'
const NC = 'Normas da Corregedoria'
const AT = 'Atualidades'
const MA = 'Matemática'
const IN = 'Informática'
const RL = 'Raciocínio Lógico'

export const AULAS_SUGERIDAS = [
  // ---------- Língua Portuguesa ----------
  L(LP, null, 'Português pré-edital TJSP (VUNESP)', 'Ciência Exata', 'tcbECa7tYaU', 'Visão geral'),
  L(LP, 'lp-interpretacao', 'Interpretação de texto na banca VUNESP', 'Prof. Álvaro Ferreira', 'S_mivI0CxJ8'),
  L(LP, 'lp-interpretacao', 'Interpretação de texto VUNESP', 'Ciência Exata', 'KvikNi28JF4'),
  L(LP, 'lp-interpretacao', 'Compreensão e interpretação de textos (Escrevente TJSP)', 'Nova Concursos', 'PhlR93jwtuM'),
  L(LP, 'lp-coesao', 'Coesão e coerência: anáfora, catáfora e mais', 'Prof. Álvaro Ferreira', 'f1vCAm294i8'),
  L(LP, 'lp-coesao', 'Coesão textual: aula completa', 'Aucielly Nobre', '60wyY63Lz0k'),
  L(LP, 'lp-coesao', 'Coesão e coerência', 'Professor Noslen', 'IIU6i3UXyi0'),
  L(LP, 'lp-significacao', 'Sinônimos e antônimos com questões da VUNESP', 'Professor Mazziotti', '4QtyXRbBkYA'),
  L(LP, 'lp-significacao', 'Sentido figurado e sentido literal (VUNESP 2019)', 'NEAF Concursos', '-2qqlZcy7o4'),
  L(LP, 'lp-significacao', 'Denotação e conotação', 'Prof. Álvaro Ferreira', 'jaoaZsx4LlM'),
  L(LP, 'lp-classes', 'Classes de palavras e como caem em concurso', 'Prof. Álvaro Ferreira', '8MWNzazS40E'),
  L(LP, 'lp-classes', 'Morfologia: classes de palavras', 'Prof. Álvaro Ferreira', 'ltrzPijgKi4'),
  L(LP, 'lp-classes', 'Classes de palavras: aula completa', 'Gramática com Laércio', 'PWsrFPy3IZg'),
  L(LP, 'lp-concordancia', 'Aulão de concordância verbal e nominal', 'Ciência Exata', '5rss4Lhmkuc'),
  L(LP, 'lp-concordancia', 'Concordância verbal e nominal na VUNESP (TJ/SP)', 'Rota de Estudo', 'v3gMHFi5krs'),
  L(LP, 'lp-regencia', 'Aulão de regência verbal e nominal', 'Ciência Exata', 'B9wUF8KcJSQ'),
  L(LP, 'lp-regencia', 'Regência na banca VUNESP', 'FOCADOS NA LÍNGUA PORTUGUESA', 'JlJTa6tEjOs'),
  L(LP, 'lp-colocacao', 'Aulão de colocação pronominal (VUNESP)', 'Ciência Exata', 'uzDFdjvMxKs'),
  L(LP, 'lp-colocacao', 'Próclise, ênclise e mesóclise', 'editalparapassar', 'kKdGVtax0Kc'),
  L(LP, 'lp-crase', 'Aulão de crase na VUNESP', 'Ciência Exata', 'koRN1W3ktlA'),
  L(LP, 'lp-crase', 'Crase em questões da VUNESP (TJSP)', 'Concurseiro Nômade', 'zmtJflMOIko'),
  L(LP, 'lp-pontuacao', 'Aulão de pontuação (VUNESP)', 'Ciência Exata', 'G6s7gR7ZTG4'),
  L(LP, 'lp-pontuacao', 'Pontuação: aulão completo', 'Prof. Álvaro Ferreira', 'G8Stjzy-87k'),
  L(LP, 'lp-pontuacao', 'Vírgula na VUNESP', 'Mestre Mário Português', 'AuDBHgKpmdM'),
  L(LP, 'lp-pontuacao', 'Aula de português para o concurso do TJSP (VUNESP)', 'Professora Flávia Rita', 'h167OHD_bOE'),

  // ---------- Direito Penal ----------
  L(DP, null, 'Direito Penal completo, parte 2 (Escrevente TJSP 2026)', 'Professor Cenoura', 'N5WpQA9vBeI', 'Visão geral'),
  L(DP, null, 'Questões comentadas de Direito Penal (Escrevente TJSP)', 'Nova Concursos', 'a9-Q6s37NmA', 'Questões'),
  L(DP, 'pen-falsidade', 'Falsidade ideológica (art. 299 do CP)', 'Canal do Penal - Prof. Rodrigo Vilela Veiga', 'ff3r3MhU5PM'),
  L(DP, 'pen-falsidade', 'Falsidade ideológica x falsidade documental', 'ProfessoraGiseleMendes', '2gjsqBpdhzI'),
  L(DP, 'pen-falsidade', 'Falsidade ideológica (Escrevente TJSP)', 'VMJ Educação', 'O9p0edhMWrg'),
  L(DP, 'pen-adm-publica', 'Resumo: peculato, corrupção, prevaricação e concussão', 'ConcurSeja', 'ptr8RnQuwYU'),
  L(DP, 'pen-adm-publica', 'Peculato (art. 312 do Código Penal)', 'Simplificando Direito Penal - Professor Rafael', 'wh9BeztUOdk'),
  L(DP, 'pen-adm-publica', 'Crimes contra a administração pública', 'Rogério Sanches Cunha', 'C9Ukkn0EpEs'),
  L(DP, 'pen-adm-justica', 'Denunciação caluniosa (art. 339 do CP)', 'NEAF Concursos', '0OKEFxvfJqo'),
  L(DP, 'pen-adm-justica', 'Falso testemunho, falsa perícia e coação no curso do processo', 'NEAF Concursos', '7HuZXPJxiPI'),

  // ---------- Direito Processual Penal ----------
  L(DPP, null, 'Direito Processual Penal (Escrevente TJSP)', 'Nova Concursos', 'wnL1GwkQi_o', 'Visão geral'),
  L(DPP, null, 'Aula grátis de Processo Penal (Prof.ª Fernanda Fisher)', 'Nova Concursos', 'bpEegX1wzCE', 'Visão geral'),
  L(DPP, null, 'Aulão de Direito Processual Penal VUNESP', 'Ceisc', 'm9-ulU99zCQ', 'Visão geral'),
  L(DPP, null, 'Todos os artigos de Processo Penal do edital (leitura)', 'Leitura de Leis', 'qqVTV8vdq1A', 'Visão geral'),
  L(DPP, 'ppe-sujeitos', 'Impedimento e suspeição do juiz (art. 254 do CPP), questão da VUNESP', 'QSconcursos', 'ZNGu-2duasA'),
  L(DPP, 'ppe-sujeitos', 'Causas de impedimento e suspeição no processo penal (questão VUNESP)', 'NEAF Concursos', 'RK9Tey1hT74'),
  L(DPP, 'ppe-sujeitos', 'Impedimento e suspeição no processo penal', 'Portal Jurisprudencia', '7P6ECgXpLEQ'),
  L(DPP, 'ppe-sujeitos', 'Incompatibilidades e impedimentos no CPP', 'NEAF Concursos', 'CqvuCAxXNow'),
  L(DPP, 'ppe-comunicacao', 'Citação e intimação: qual a diferença?', 'Ana Carolina Aidar', 'HAeVOmvanU0'),
  L(DPP, 'ppe-comunicacao', 'Citação por edital', 'Rodrigo Castello', '5-eehjY0H24'),
  L(DPP, 'ppe-procedimentos', 'Processo e procedimentos: disposições gerais', 'Ana Carolina Aidar', 'bTagCw7fbkw'),
  L(DPP, 'ppe-recursos', 'Recurso em sentido estrito (RESE)', 'Ana Carolina Aidar', 'AmgUjPT9Je8'),
  L(DPP, 'ppe-recursos', 'Apelação x RESE', 'Estratégia OAB', 'WhNBu2D47io'),
  L(DPP, 'ppe-recursos', 'Embargos infringentes e de nulidade', 'Fernando Capez', 'KFeFCbMamb4'),
  L(DPP, 'ppe-recursos', 'Embargos de declaração', 'Fernando Capez', '7MM8e82arMc'),
  L(DPP, 'ppe-jecrim', 'Juizado Especial Criminal', 'Supremo', 'bnURJs2uRVI'),

  // ---------- Direito Processual Civil ----------
  L(DPC, null, 'Processo Civil: aula completa (Escrevente TJSP)', 'Nova Concursos', 'MOPsjuSyKNI', 'Visão geral'),
  L(DPC, null, 'Bateria de questões de Processo Civil', 'Nova Concursos', 'AqHgGwuN0l4', 'Questões'),
  L(DPC, 'pc-juiz', 'Impedimento e suspeição (arts. 144 a 148 do CPC), para o TJSP', 'Gustavo Fregapani', 'GrP-mtSwiME'),
  L(DPC, 'pc-juiz', 'CPC, arts. 144 a 155 (Escrevente TJSP 2024)', 'LEIS BRASILEIRAS EM ÁUDIO', '-xU92w7YsRo'),
  L(DPC, 'pc-juiz', 'Impedimento e suspeição', 'Ricardo Torques', '3sL0TYqc7mc'),
  L(DPC, 'pc-juiz', 'Arguição de impedimento ou suspeição', 'Professor Renê Hellman', 'P3RfxtRoK5o'),
  L(DPC, 'pc-atos', 'Prazos processuais e lugar dos atos', 'João Spindola', '3WGtEzqHq-g'),
  L(DPC, 'pc-tutela', 'Tutelas provisórias para o TJSP (aula gratuita)', 'Qconcursos', 'XFPpqh8ZTPA'),
  L(DPC, 'pc-tutela', 'Tutelas provisórias (Escrevente TJSP 2023)', 'BASE JURÍDICA - Donery S Amante', 'DHupt8YsJYA'),
  L(DPC, 'pc-tutela', 'Tutela de evidência', 'Professor Renê Hellman', 'VKsP1sbbGZY'),
  L(DPC, 'pc-procedimento', 'Cumprimento de sentença (arts. 513 a 538)', 'TecConcursos', 'JMRE8X_ciaI'),
  L(DPC, 'pc-procedimento', 'Cumprimento de sentença: disposições gerais', 'Trilhante', 'LOwj_mRLBvw'),
  L(DPC, 'pc-procedimento', 'Cumprimento de sentença', 'Ricardo Torques', '_Ks61Gbm6-U'),
  L(DPC, 'pc-recursos', 'Recursos', 'Ricardo Torques', '9k5ETWUFX2Y'),
  L(DPC, 'pc-recursos', 'Recursos: disposições gerais e apelação (arts. 994 a 1.014)', 'Legislação em áudio', 'atWIar0KuRg'),
  L(DPC, 'pc-recursos', 'Agravo interno e embargos de declaração', 'Prof. Rossi', 'BP3nEqfc0ME'),
  L(DPC, 'pc-juizados', 'Juizados Especiais (Escrevente TJSP)', 'Antonio Sanches', 'wR17aE5HxX8'),
  L(DPC, 'pc-fazenda', 'Lei 12.153/09: Juizado Especial da Fazenda Pública', 'Daniel Lopes', '8O24fXN943A'),
  L(DPC, 'pc-fazenda', 'Lei 12.153/2009 (Escrevente 2023)', 'BASE JURÍDICA - Donery S Amante', '3BOGFiueE3g'),
  L(DPC, 'pc-fazenda', 'Lei 12.153/2009 (TJ-SP 2024)', 'Caverna do Concurso', 'nQnh1ucUGrE'),

  // ---------- Direito Constitucional ----------
  L(DC, null, 'Direito Constitucional do básico (Escrevente TJSP)', 'Nova Concursos', 'sTVFMrgtA_A', 'Visão geral'),
  L(DC, 'cf-direitos', 'Gabaritando direitos e garantias fundamentais', 'Nova Concursos', 'w3zcocvnVbw'),
  L(DC, 'cf-direitos', 'Garantias fundamentais, estudando por questões (TJSP/VUNESP)', 'Professor Mateus Silveira', 'uHkib2LzVSo'),
  L(DC, 'cf-direitos', 'Art. 5º: direitos e deveres individuais e coletivos', 'Focus Concursos', 'CR6XMyYqLHE'),
  L(DC, 'cf-sociais', 'Direitos sociais (arts. 6º a 11)', 'Escola de Concursados do Mario Tossan', 'LlEKrSk0LFw'),
  L(DC, 'cf-sociais', 'Direitos sociais (Escrevente TJSP 2025)', 'Nova Concursos', '0Svm74iUvfg'),
  L(DC, 'cf-sociais', 'Direitos sociais, arts. 6º a 11 (playlist)', 'Prof. Emerson Bruno', 'pl:PLhTKk53U8pNnuT18wUhvJn5xue7HauG7A'),
  L(DC, 'cf-nacionalidade', 'Quem é brasileiro nato? Nacionalidade na CF', 'NEAF Concursos', 'IqRVfMdv4IA'),
  L(DC, 'cf-nacionalidade', 'Brasileiros natos e naturalizados', 'comunidade do concurso', 'wR3Fmuuf8VU'),
  L(DC, 'cf-adm-publica', 'Da Administração Pública (arts. 37 a 41)', 'Prof. Eriksen Almerão', 'EGD2phq-x3g'),
  L(DC, 'cf-adm-publica', 'Administração Pública para TJSP, MPSP e TCMSP', 'NEAF Concursos', 'AIfrWpTpn-8'),
  L(DC, 'cf-adm-publica', 'Administração Pública: arts. 37 e 38', 'Railson Rodrigues', 'mEzbwu5Fin0'),
  L(DC, 'cf-art92', 'Art. 92 da CF (Escrevente TJSP 2023)', 'Daniel Lopes', 'EPJJ6CGTZ2o'),
  L(DC, 'cf-art92', 'Art. 92: Poder Judiciário', 'Prof. Leonardo Saraiva', 'm_MaZFR9sRg'),

  // ---------- Direito Administrativo ----------
  L(DA, 'adm-estatuto', 'Estatuto dos Funcionários Públicos (Escrevente TJSP)', 'Nova Concursos', 'CgiilkIIYHE'),
  L(DA, 'adm-estatuto', 'Aula grátis sobre o Estatuto (TJ SP e MP SP)', 'JC Concursos', 'ItrNuw7n7hs'),
  L(DA, 'adm-estatuto', 'Estatuto, aula 01', 'GETUSSP', 'LIEuzkoB1QA'),
  L(DA, 'adm-estatuto', 'Estatuto, aula 02', 'GETUSSP', 'KvGzR6We1Cc'),
  L(DA, 'adm-estatuto', 'Estatuto: artigos 239 a 323', 'Caverna do Concurso', 'EMBV69LE4Nc'),
  L(DA, 'adm-improbidade', 'Lei de Improbidade: aulão grátis (TJ SP)', 'Nova Concursos', '2Xp8puOWY_s'),
  L(DA, 'adm-improbidade', 'Improbidade artigo por artigo (Escrevente TJSP 2026)', 'Professor Cenoura | Direito Penal', '_p-ZXrkxTxc'),
  L(DA, 'adm-improbidade', 'Lei de Improbidade: aula completa', 'Prof. Eriksen Almerão', 'pc8eZwQyv9U'),

  // ---------- Legislação interna e Normas da Corregedoria ----------
  L(NC, 'li-ncgj', 'Normas da Corregedoria atualizadas (Escrevente TJSP)', 'Professor Douglas Oliveira', '6x0TxjrTa_k'),
  L(NC, 'li-ncgj', 'Como gabaritar as Normas da Corregedoria', 'Carlos Ribeiro ', 'jUjRjycxWhk'),
  L(NC, 'li-ncgj', 'Normas da Corregedoria (concurso 2024)', 'Nova Concursos', 'EyFOFbLv8PU'),
  L(NC, 'li-ncgj', 'Questões de Normas da Corregedoria', 'Nova Concursos', 'KRgA9tZX1yw'),
  L(NC, 'li-teletrabalho', 'Resolução 850/2021: teletrabalho (Escrevente TJSP 2025)', 'Professor Cenoura | Direito Penal', 'PonuVAGYng8'),
  L(NC, 'li-teletrabalho', 'Resolução 850/2021: teletrabalho', 'André Yan', '_dVRZCj56ow'),
  L(NC, 'li-teletrabalho', 'Resolução 850/2021 explicada + leitura dos arts. 23 a 40', 'editalparapassar', 'iXz2Q06G_zA'),
  L(NC, 'li-eproc', 'eproc no TJSP: Resolução 963/2025 (podcast didático)', 'editalparapassar', 'D_gMbZXAy38'),
  L(NC, 'li-eproc', 'Resolução 963/2025: sistema eproc', 'LEIS BRASILEIRAS EM ÁUDIO', 'g3GtJRrniWQ'),
  L(NC, 'li-eproc', '25 questões de eproc (Resolução 963/2025)', 'editalparapassar', 'tbC2cVsYRvw'),
  L(NC, 'li-lc1111', 'Plano de Cargos e Carreiras do TJSP (LC 1.111/2010)', 'DR. DIREITO', 'G0Imb6KnnIQ'),
  L(NC, 'li-regimento', 'Regimento Interno do TJSP (aula 6)', 'André Yan', '04cffGjQhSk'),
  L(NC, 'li-regimento', 'Regimento Interno do TJSP: resumo', 'Trajetória Concursos', 'Ao6o7OsyaN0'),

  // ---------- Atualidades ----------
  L(AT, 'at-pcd', 'Estatuto da Pessoa com Deficiência (Escrevente TJSP 2023)', 'BASE JURÍDICA - Donery S Amante', 'ofcOXvC6SB8'),
  L(AT, 'at-pcd', 'Questões do Estatuto da Pessoa com Deficiência (VUNESP)', 'QC Aprova Concursos Públicos', 'nsv8DheYpCE'),
  L(AT, 'at-pcd', 'Estatuto da Pessoa com Deficiência (Lei 13.146/2015)', 'PEDAGOFLIX', '6nDpwHcLzQ4'),

  // ---------- Matemática ----------
  L(MA, null, 'As 10 questões de matemática da VUNESP', 'Prof. Edu Tavares | Matemática do Zero à Aprovação', 'mj481l8IeLU', 'Questões'),
  L(MA, 'mat-numeros', 'Aulão de MMC e MDC (VUNESP)', 'Ciência Exata', 'IGj3KyEWnEw'),
  L(MA, 'mat-numeros', 'MMC e MDC: questões resolvidas (VUNESP)', 'Ciência Exata', '-KXW03bm6Bo'),
  L(MA, 'mat-razao', 'Razão, proporção, regra de três e porcentagem', 'Canal Unigranrio', 'tED3MGhSSno'),
  L(MA, 'mat-razao', 'Aulão de razão e proporção (VUNESP)', 'Ciência Exata', 'WzQfKm7VYNc'),
  L(MA, 'mat-porcentagem', 'Porcentagem (Escrevente TJSP 2021)', 'Prof. Kaká - Raciocínio Lógico e Matemática', 'mXYueMJoqN0'),
  L(MA, 'mat-porcentagem', 'Porcentagem com regra de três (VUNESP e FGV)', 'Prof. Reinaldo Amirato', 'SDnkE994oPg'),
  L(MA, 'mat-medias', 'Aulão de média aritmética (VUNESP)', 'Ciência Exata', 'QMtQ1I8G4IY'),
  L(MA, 'mat-medias', 'Média aritmética simples e ponderada', 'Professora Gisele Ramos - Matemática', 'ad6ZS54Z_mk'),
  L(MA, 'mat-juros', 'Juros simples: questões resolvidas (VUNESP)', 'Professor Júnior Vieira', '3YcrYf7M_rU'),
  L(MA, 'mat-equacoes', 'Aulão de equação do 1º grau (VUNESP)', 'Ciência Exata', 'DpZU8RArHH4'),
  L(MA, 'mat-equacoes', 'Aulão de equações do 1º e do 2º graus (VUNESP)', 'Ciência Exata', 'g483KBJ2YQA'),
  L(MA, 'mat-equacoes', 'Aulão de sistemas de equações (VUNESP)', 'Ciência Exata', 'CfvDQUtNheg'),
  L(MA, 'mat-grandezas', 'Aulão de gráficos e tabelas (VUNESP)', 'Ciência Exata', 'SlVbkrbCH4U'),
  L(MA, 'mat-grandezas', 'Aulão de grandezas e medidas (VUNESP)', 'Ciência Exata', '5XSHUTcjRFA'),
  L(MA, 'mat-geometria', 'Aulão de geometria (VUNESP)', 'Ciência Exata', 'mKiitpAZxAA'),
  L(MA, 'mat-geometria', 'Noções de geometria (VUNESP)', 'Prof. Sérgio Mendes', 'uzYKEuJ8ogw'),

  // ---------- Raciocínio Lógico ----------
  L(RL, null, 'Aulão de Raciocínio Lógico VUNESP 2024', 'Ciência Exata', 'oqQyuV42Lk0', 'Questões da VUNESP'),
  L(RL, null, 'Raciocínio Lógico VUNESP (playlist)', 'Ciência Exata', 'pl:PLtHEmAz8xX1urpMRzGI59C1j9D9AHY3ml', 'Questões da VUNESP'),
  L(RL, 'rl-estruturas', 'Negação e equivalência (lógica proposicional)', 'Revisão Animada', 'R3DySXXznA8'),
  L(RL, 'rl-estruturas', 'Negação de proposições', 'Matemática em Exercícios', 'w7P89v5aDxE'),
  L(RL, 'rl-estruturas', 'Equivalências e negações das proposições compostas', 'Tiago Gomes', 'QMkHs9kT9WE'),
  L(RL, 'rl-relacoes', 'Associação lógica, verdades e mentiras (VUNESP)', 'Ciência Exata', 'aYtQs92ccHI'),
  L(RL, 'rl-relacoes', 'Relações arbitrárias entre pessoas (aula 3/4)', 'Lac Concursos - Principal', 'Fl7NWhlakRA'),
  L(RL, 'rl-sequencias', 'Sequências numéricas na VUNESP (TJ-SP 2025)', 'Prof. Edu Tavares | Matemática do Zero à Aprovação', 'Yn9EguapweY'),
  L(RL, 'rl-sequencias', 'Sequências numéricas: exercícios da VUNESP', 'NEAF Concursos', 'YJBycPnfp6Q'),

  // ---------- Informática ----------
  L(IN, null, 'Gabaritando os temas principais', 'Nova Concursos', 't3jiJ3Ztlf0', 'Visão geral'),
  L(IN, null, 'Questões de Informática da VUNESP', 'Nova Concursos', '-2l4792vXPs', 'Questões'),
  L(IN, null, 'Informática TJSP: Windows, Office e internet (playlist)', 'ROMILTON JÚNIOR', 'pl:PLM2kqWhoolXGE9OGnes2BCIlPTGVJaYJq', 'Visão geral'),
  L(IN, 'inf-windows', 'MS-Windows 10 ou superior (Escrevente TJSP)', 'ROMILTON JÚNIOR', 'jPNlbKbqgpI'),
  L(IN, 'inf-windows', 'Questões comentadas de Windows', 'Nova Concursos', '5U1mRnbGXqg'),
  L(IN, 'inf-word', 'Aulão de Word (VUNESP)', 'Ciência Exata', 'xsr2KNPUvP0'),
  L(IN, 'inf-excel', 'Aula completa de Excel (Escrevente TJSP)', 'Nova Concursos', 'bfHoR57T_L4'),
  L(IN, 'inf-email', 'Aulão de correio eletrônico (VUNESP)', 'Ciência Exata', 'fnAOIYIdXa4'),
  L(IN, 'inf-email', 'Correio eletrônico: CC, CCO e Outlook (VUNESP)', 'Prof. Fabiano Abreu', 'tZ91lgq8dVM'),
  L(IN, 'inf-internet', 'Internet: URL, links e sites', 'Fernando Nishimura de Aragão (Informática)', 'crxGZNk7Ydk'),
  L(IN, 'inf-internet', 'Busca e pesquisa na web', 'ROMILTON JÚNIOR', 'dqZKjjTxIOQ'),
  L(IN, 'inf-internet', 'Aulão de Informática VUNESP 2025', 'Ciência Exata', 'gTBE3Ed0brI'),
  L(IN, 'inf-teams', 'Super aulão de Microsoft Teams (TJSP)', 'Nova Concursos', '1b3Gpd5mE6g'),
  L(IN, 'inf-teams', 'MS Teams: questões comentadas (Escrevente TJSP 2025)', 'Nova Concursos', '46yoJAkU5HY'),
  L(IN, 'inf-onedrive', 'OneDrive (Escrevente TJSP 2025)', 'Nova Concursos', 'KNNXkCu42AI'),
  L(IN, 'inf-onedrive', 'OneDrive: teoria e questões (TJSP)', 'Fernando Nishimura de Aragão (Informática)', 'PwGmS_VooLg'),
]
