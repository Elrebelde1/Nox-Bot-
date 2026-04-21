import hispamemes from 'hispamemes'
import axios from 'axios'

const canal = '120363409416185213@newsletter'

const query = [
  'story wa', 'story sad', 'video fun', 'story wa galau',
  'story wa sindiran', 'story wa bahagia',
  'story wa lirik lagu overlay', 'story wa lirik lagu',
  'video viral', 'edits animes phonk', 'edits ultra phonk',
  'carros edits', 'edits series phonk'
]

async function obtenerVideo() {
try {
const keywords = query[Math.floor(Math.random() * query.length)]
const res = await axios.post('https://tikwm.com/api/feed/search', 
      new URLSearchParams({
        keywords, count: 10, cursor: 0, HD: 1
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': 'current_language=en',
          'User-Agent': 'Mozilla/5.0'
        }
      })

const videos = res.data?.data?.videos
    if (!videos || videos.length === 0) return null

    const random = videos[Math.floor(Math.random() * videos.length)]
    return {
      url: random.play,
      title: random.title || '🪐'
    }
} catch (e) {
console.error('🪐 Error', e)
return null
  }
}

let handler = async (m, { conn }) => {
  const tipo = Math.random() < 0.5 ? 'meme' : 'video'

if (tipo === 'meme') {
const meme = hispamemes.meme()
await conn.sendMessage(canal, {
image: { url: meme },
caption: '🤣 ¡Memecito!'
})
m.reply('✅ Meme enviado al canal.')

} else {
const video = await obtenerVideo()
if (!video) return m.reply('😖 No se pudo obtener un video.')
await conn.sendMessage(canal, {
video: { url: video.url },
caption: video.title
})
m.reply('✅ Video enviado al canal.')
  }
}

handler.help = ['publicar']
handler.tags = ['owner']
handler.command = ['publicar']
handler.owner = true

export default handler 