// Entende links do YouTube (vídeo ou playlist) e monta o endereço seguro de incorporação.
// O app guarda só o link: nenhum vídeo é hospedado aqui.

export function parseYouTube(input) {
  let url
  try {
    url = new URL(String(input).trim())
  } catch {
    return null
  }
  const host = url.hostname.replace(/^(www|m)\./, '')
  if (host !== 'youtube.com' && host !== 'youtu.be') return null

  const list = url.searchParams.get('list')
  if (url.pathname === '/playlist' && list && /^[\w-]+$/.test(list)) return { kind: 'playlist', id: list }

  let id = null
  if (host === 'youtu.be') id = url.pathname.slice(1)
  else if (url.pathname === '/watch') id = url.searchParams.get('v')
  else id = url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/)?.[1] ?? null

  return id && /^[\w-]{11}$/.test(id) ? { kind: 'video', id } : null
}

// Endereço canônico: serve também para detectar o mesmo vídeo cadastrado duas vezes.
export const canonicalUrl = (p) =>
  p.kind === 'playlist' ? `https://www.youtube.com/playlist?list=${p.id}` : `https://www.youtube.com/watch?v=${p.id}`

// "nocookie": o YouTube só registra o visitante se ele apertar o play.
export const embedUrl = (p) =>
  p.kind === 'playlist'
    ? `https://www.youtube-nocookie.com/embed/videoseries?list=${p.id}`
    : `https://www.youtube-nocookie.com/embed/${p.id}?rel=0`

export const thumbnailUrl = (p) => (p.kind === 'video' ? `https://i.ytimg.com/vi/${p.id}/mqdefault.jpg` : null)
