// Cada matéria tem uma cor fixa, como as lombadas coloridas de pastas de estudo.
const BY_NAME = {
  'lingua portuguesa': '#e4572e',
  'direito constitucional': '#2e6fd8',
  'direito administrativo': '#7b4fd1',
  'direito penal': '#c9314f',
  'direito processual penal': '#b45309',
  'direito processual civil': '#0f9d8a',
  'normas da corregedoria': '#6b7a8f',
  matematica: '#3f8f3f',
  'raciocinio logico': '#d99a00',
  informatica: '#1c8fb5',
  atualidades: '#b24da8',
}

const FALLBACK = ['#e4572e', '#2e6fd8', '#7b4fd1', '#0f9d8a', '#d99a00', '#b24da8', '#3f8f3f', '#1c8fb5']

const normalize = (s) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

export function subjectColor(name) {
  const key = normalize(name)
  if (BY_NAME[key]) return BY_NAME[key]
  // matérias criadas pelo usuário: cor estável a partir do nome
  let hash = 0
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return FALLBACK[hash % FALLBACK.length]
}

// Para usar direto no atributo style: { '--tag': '#...' }
export const tagStyle = (name) => ({ '--tag': subjectColor(name) })
