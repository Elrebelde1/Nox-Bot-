import hispamemes from 'hispamemes'
import axios from 'axios'
import delay from 'delay'

const canal = '120363409416185213@newsletter'

const query = [
  'videos graciosos', 'video fun', 'Funny videos',
  'memes', 'memes phonk', 'viral meme',
  'carros edits', 'edits series phonk'
]

async function obtenerVideo() {
  const keywords = query[Math.floor(Math.random() * query.length)]
  try {
    const { data } = await axios.post(
      'https://tikwm.com/api/feed/search',
      new URLSearchParams({
        keywords,
        count: '10',
        cursor: '0',
        HD: '1'
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        }
      }
    )

    const videos = data?.data?.videos
    if (!videos || videos.length === 0) return null

    const random = videos[Math.floor(Math.random() * videos.length)]
    return {
      url: random.play,
      title: random.title || 'Contenido para el canal 🚀'
    }
  } catch (e) {
    return null
  }
}

async function obtenerMeme() {
  try {
    return await hispamemes.meme()
  } catch (e) {
    return null
  }
}

async function enviarAlCanal(conn, contenido) {
  try {
    // Simula que el bot está "escribiendo" o "grabando" para parecer humano
    await conn.sendPresenceUpdate('composing', canal)
    await delay(2000)
    await conn.sendMessage(canal, contenido)
  } catch (e) {
    console.error('Error al enviar:', e)
  }
}

async function autopost(conn) {
  console.log('🚀 Sistema Autopost Barboza Iniciado')

  while (true) {
    try {
      const tipo = Math.random() < 0.5 ? 'meme' : 'video'

      if (tipo === 'meme') {
        const meme = await obtenerMeme()
        if (meme) {
          await enviarAlCanal(conn, {
            image: { url: meme },
            caption: '✨ ¡Nuevo contenido! Disfruten.'
          })
        }
      } else {
        const video = await obtenerVideo()
        if (video && video.url) {
          await enviarAlCanal(conn, {
            video: { url: video.url },
            caption: `🔥 ${video.title}`
          })
        }
      }

      // Intervalo inteligente: 15-20 minutos aleatorios
      const minutos = Math.floor(Math.random() * (20 - 15 + 1)) + 15
      const espera = minutos * 60 * 1000
      
      console.log(`🕒 Esperando ${minutos} minutos para la próxima publicación...`)
      await delay(espera)

    } catch (err) {
      await delay(60000)
    }
  }
}

export default autopost
