// Aulas gratuitas do YouTube sugeridas como ponto de partida.
// Cada link foi conferido no YouTube (existe, é público e pode ser incorporado) e o canal é o autor do vídeo.
// São conteúdos de terceiros, em sua maioria preparados para as provas de 2023 a 2025: confira sempre
// o edital vigente. O usuário escolhe adicionar, e depois pode remover ou acrescentar as suas.
const yt = (id) => `https://www.youtube.com/watch?v=${id}`
const pl = (id) => `https://www.youtube.com/playlist?list=${id}`

export const AULAS_SUGERIDAS = [
  // Língua Portuguesa
  { subject: 'Língua Portuguesa', topic: 'Panorama da prova', title: 'Português pré-edital TJSP (VUNESP)', channel: 'Ciência Exata', url: yt('tcbECa7tYaU') },
  { subject: 'Língua Portuguesa', topic: 'Crase', title: 'Aulão de crase na VUNESP', channel: 'Ciência Exata', url: yt('koRN1W3ktlA') },
  { subject: 'Língua Portuguesa', topic: 'Crase', title: 'Crase em questões da VUNESP (TJSP)', channel: 'Concurseiro Nômade', url: yt('zmtJflMOIko') },
  { subject: 'Língua Portuguesa', topic: 'Concordância verbal e nominal', title: 'Aulão de concordância verbal e nominal', channel: 'Ciência Exata', url: yt('5rss4Lhmkuc') },
  { subject: 'Língua Portuguesa', topic: 'Concordância verbal e nominal', title: 'Concordância verbal e nominal na VUNESP (TJ/SP)', channel: 'Rota de Estudo', url: yt('v3gMHFi5krs') },
  { subject: 'Língua Portuguesa', topic: 'Regência verbal e nominal', title: 'Aulão de regência verbal e nominal', channel: 'Ciência Exata', url: yt('B9wUF8KcJSQ') },
  { subject: 'Língua Portuguesa', topic: 'Regência verbal e nominal', title: 'Regência na banca VUNESP', channel: 'FOCADOS NA LÍNGUA PORTUGUESA', url: yt('JlJTa6tEjOs') },
  { subject: 'Língua Portuguesa', topic: 'Colocação pronominal', title: 'Próclise, ênclise e mesóclise', channel: 'editalparapassar', url: yt('kKdGVtax0Kc') },

  // Direito Constitucional
  { subject: 'Direito Constitucional', topic: 'Panorama da matéria', title: 'Direito Constitucional do básico (Escrevente TJSP)', channel: 'Nova Concursos', url: yt('sTVFMrgtA_A') },
  { subject: 'Direito Constitucional', topic: 'Direitos e garantias fundamentais', title: 'Gabaritando direitos e garantias fundamentais', channel: 'Nova Concursos', url: yt('w3zcocvnVbw') },
  { subject: 'Direito Constitucional', topic: 'Direitos e garantias fundamentais', title: 'Garantias fundamentais, estudando por questões (TJSP/VUNESP)', channel: 'Professor Mateus Silveira', url: yt('uHkib2LzVSo') },
  { subject: 'Direito Constitucional', topic: 'Direitos e garantias fundamentais', title: 'Art. 5º: direitos e deveres individuais e coletivos', channel: 'Focus Concursos', url: yt('CR6XMyYqLHE') },

  // Direito Administrativo
  { subject: 'Direito Administrativo', topic: 'Estatuto dos Funcionários (Lei 10.261/68)', title: 'Estatuto dos Funcionários Públicos (Escrevente TJSP)', channel: 'Nova Concursos', url: yt('CgiilkIIYHE') },
  { subject: 'Direito Administrativo', topic: 'Estatuto dos Funcionários (Lei 10.261/68)', title: 'Aula grátis sobre o Estatuto (TJ SP e MP SP)', channel: 'JC Concursos', url: yt('ItrNuw7n7hs') },
  { subject: 'Direito Administrativo', topic: 'Estatuto dos Funcionários (Lei 10.261/68)', title: 'Estatuto, aula 01', channel: 'GETUSSP', url: yt('LIEuzkoB1QA') },
  { subject: 'Direito Administrativo', topic: 'Estatuto dos Funcionários (Lei 10.261/68)', title: 'Estatuto, aula 02', channel: 'GETUSSP', url: yt('KvGzR6We1Cc') },
  { subject: 'Direito Administrativo', topic: 'Estatuto dos Funcionários (Lei 10.261/68)', title: 'Estatuto: artigos 239 a 323', channel: 'Caverna do Concurso', url: yt('EMBV69LE4Nc') },

  // Direito Penal
  { subject: 'Direito Penal', topic: 'Crimes contra a administração pública', title: 'Resumo: peculato, corrupção, prevaricação e concussão', channel: 'ConcurSeja', url: yt('ptr8RnQuwYU') },
  { subject: 'Direito Penal', topic: 'Crimes contra a administração pública', title: 'Peculato (art. 312 do Código Penal)', channel: 'Simplificando Direito Penal', url: yt('wh9BeztUOdk') },
  { subject: 'Direito Penal', topic: 'Crimes contra a administração pública', title: 'Crimes contra a administração pública', channel: 'Rogério Sanches Cunha', url: yt('C9Ukkn0EpEs') },
  { subject: 'Direito Penal', topic: 'Questões', title: 'Questões comentadas de Direito Penal (Escrevente TJSP)', channel: 'Nova Concursos', url: yt('a9-Q6s37NmA') },

  // Direito Processual Penal
  { subject: 'Direito Processual Penal', topic: 'Panorama da matéria', title: 'Direito Processual Penal (Escrevente TJSP)', channel: 'Nova Concursos', url: yt('wnL1GwkQi_o') },
  { subject: 'Direito Processual Penal', topic: 'Panorama da matéria', title: 'Aula grátis de Processo Penal (Prof.ª Fernanda Fisher)', channel: 'Nova Concursos', url: yt('bpEegX1wzCE') },
  { subject: 'Direito Processual Penal', topic: 'Panorama da matéria', title: 'Aulão de Direito Processual Penal VUNESP', channel: 'Ceisc', url: yt('m9-ulU99zCQ') },
  { subject: 'Direito Processual Penal', topic: 'Juizado Especial Criminal', title: 'Juizado Especial Criminal', channel: 'Supremo', url: yt('bnURJs2uRVI') },

  // Direito Processual Civil
  { subject: 'Direito Processual Civil', topic: 'Panorama da matéria', title: 'Processo Civil: aula completa (Escrevente TJSP)', channel: 'Nova Concursos', url: yt('MOPsjuSyKNI') },
  { subject: 'Direito Processual Civil', topic: 'Prazos processuais', title: 'Prazos processuais e lugar dos atos', channel: 'João Spindola', url: yt('3WGtEzqHq-g') },
  { subject: 'Direito Processual Civil', topic: 'Juizados Especiais', title: 'Juizados Especiais (Escrevente TJSP)', channel: 'Antonio Sanches', url: yt('wR17aE5HxX8') },
  { subject: 'Direito Processual Civil', topic: 'Questões', title: 'Bateria de questões de Processo Civil', channel: 'Nova Concursos', url: yt('AqHgGwuN0l4') },

  // Normas da Corregedoria
  { subject: 'Normas da Corregedoria', topic: 'Aulas gerais', title: 'Normas da Corregedoria atualizadas (Escrevente TJSP)', channel: 'Professor Douglas Oliveira', url: yt('6x0TxjrTa_k') },
  { subject: 'Normas da Corregedoria', topic: 'Aulas gerais', title: 'Como gabaritar as Normas da Corregedoria', channel: 'Carlos Ribeiro', url: yt('jUjRjycxWhk') },
  { subject: 'Normas da Corregedoria', topic: 'Aulas gerais', title: 'Normas da Corregedoria (concurso 2024)', channel: 'Nova Concursos', url: yt('EyFOFbLv8PU') },
  { subject: 'Normas da Corregedoria', topic: 'Questões', title: 'Questões de Normas da Corregedoria', channel: 'Nova Concursos', url: yt('KRgA9tZX1yw') },

  // Matemática
  { subject: 'Matemática', topic: 'Razão, proporção e regra de três', title: 'Razão, proporção, regra de três e porcentagem', channel: 'Canal Unigranrio', url: yt('tED3MGhSSno') },
  { subject: 'Matemática', topic: 'Razão, proporção e regra de três', title: 'Aulão de razão e proporção (VUNESP)', channel: 'Ciência Exata', url: yt('WzQfKm7VYNc') },
  { subject: 'Matemática', topic: 'Porcentagem', title: 'Porcentagem (Escrevente TJSP 2021)', channel: 'Prof. Kaká', url: yt('mXYueMJoqN0') },
  { subject: 'Matemática', topic: 'Porcentagem', title: 'Porcentagem com regra de três (VUNESP e FGV)', channel: 'Prof. Reinaldo Amirato', url: yt('SDnkE994oPg') },
  { subject: 'Matemática', topic: 'Questões', title: 'As 10 questões de matemática da VUNESP', channel: 'Prof. Edu Tavares', url: yt('mj481l8IeLU') },

  // Raciocínio Lógico
  { subject: 'Raciocínio Lógico', topic: 'Negação e equivalência', title: 'Negação e equivalência (lógica proposicional)', channel: 'Revisão Animada', url: yt('R3DySXXznA8') },
  { subject: 'Raciocínio Lógico', topic: 'Negação e equivalência', title: 'Negação de proposições', channel: 'Matemática em Exercícios', url: yt('w7P89v5aDxE') },
  { subject: 'Raciocínio Lógico', topic: 'Questões da VUNESP', title: 'Aulão de Raciocínio Lógico VUNESP 2024', channel: 'Ciência Exata', url: yt('oqQyuV42Lk0') },
  { subject: 'Raciocínio Lógico', topic: 'Questões da VUNESP', title: 'Raciocínio Lógico VUNESP (playlist)', channel: 'Ciência Exata', url: pl('PLtHEmAz8xX1urpMRzGI59C1j9D9AHY3ml'), kind: 'playlist' },

  // Informática
  { subject: 'Informática', topic: 'Panorama da matéria', title: 'Gabaritando os temas principais', channel: 'Nova Concursos', url: yt('t3jiJ3Ztlf0') },
  { subject: 'Informática', topic: 'Windows', title: 'MS-Windows 10 ou superior (Escrevente TJSP)', channel: 'Romilton Júnior', url: yt('jPNlbKbqgpI') },
  { subject: 'Informática', topic: 'Windows', title: 'Questões comentadas de Windows', channel: 'Nova Concursos', url: yt('5U1mRnbGXqg') },
  { subject: 'Informática', topic: 'Word', title: 'Aulão de Word (VUNESP)', channel: 'Ciência Exata', url: yt('xsr2KNPUvP0') },
  { subject: 'Informática', topic: 'Excel', title: 'Aula completa de Excel (Escrevente TJSP)', channel: 'Nova Concursos', url: yt('bfHoR57T_L4') },
  { subject: 'Informática', topic: 'Questões', title: 'Questões de Informática da VUNESP', channel: 'Nova Concursos', url: yt('-2l4792vXPs') },
  { subject: 'Informática', topic: 'Playlist completa', title: 'Informática TJSP: Windows, Office e internet (playlist)', channel: 'Romilton Júnior', url: pl('PLM2kqWhoolXGE9OGnes2BCIlPTGVJaYJq'), kind: 'playlist' },
]
