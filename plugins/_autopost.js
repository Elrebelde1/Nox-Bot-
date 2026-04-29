import hispamemes from 'hispamemes'
import axios from 'axios'
import delay from 'delay'

const canal = '120363409416185213@newsletter'

// Agregamos términos de Sasuke para que el bot tenga su esencia
const query = [
  'sasuke uchiha edit', 'sasuke vs itachi', 'sasuke amv phonk',
  'videos graciosos', 'memes random', 'carros edits', 
  'edits series phonk', 'sasuke renegado edit'
]

const frasesSasuke = [
  '🐍 El camino de la venganza es solitario...',
  '👁️ Solo aquellos que sufren entienden la verdadera paz.',
  '⚡ Chidori!',
  '🔥 No me importa lo que piensen los demás.',
  '🌀 El Sharingan lo ve todo.'
]

async function obtenerVideo() {
  const keywords = query[Math.floor(Math.random() * query.length)]
  try {
    const { data } = await axios.post(
      'https://tikwm.com/api/feed/search',
      new URLSearchParams({ keywords, count: '5', cursor: '0', HD: '1' }).toString(),
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    )
    const videos = data?.data?.videos
    if (!videos || videos.length === 0) return null
    const random = videos[Math.floor(Math.random() * videos.length)]
    return { url: random.play, title: random.title }
  } catch (e) { return null }
}

async function enviarConSimulacion(conn, contenido) {
  try {
    await conn.sendPresenceUpdate('available', canal)
    await delay(Math.floor(Math.random() * 3000) + 2000)

    const status = contenido.video ? 'recording' : 'composing'
    await conn.sendPresenceUpdate(status, canal)
    
    await delay(Math.floor(Math.random() * 8000) + 5000) 

    await conn.sendMessage(canal, contenido)
    await conn.sendPresenceUpdate('paused', canal)
  } catch (e) { console.error('Error en envío:', e) }
}

async function autopost(conn) {
  console.log('🛡️ Sasuke Bot: Modo Renegado (Anti-Baneo) Activo');

  while (true) {
    try {
      const tipo = Math.random() < 0.5 ? 'meme' : 'video'
      const frase = frasesSasuke[Math.floor(Math.random() * frasesSasuke.length)]

      if (tipo === 'meme') {
        const meme = await hispamemes.meme()
        if (meme) {
          await enviarConSimulacion(conn, {
            image: { url: meme },
            caption: frase
          })
        }
      } else {
        const video = await obtenerVideo()
        if (video?.url) {
          await enviarConSimulacion(conn, {
            video: { url: video.url },
            caption: video.title ? `${frase}\n\n— ${video.title}` : frase
          })
        }
      }

      // Tiempos dinámicos para evitar detección
      const min = 30; 
      const max = 75;
      const esperaAleatoria = Math.floor(Math.random() * (max - min + 1) + min) * 60 * 1000;

      console.log(`🕒 Siguiente movimiento en ${Math.round(esperaAleatoria / 60000)} minutos.`);
      await delay(esperaAleatoria);

    } catch (err) {
      await delay(300000); 
    }
  }
}

export default autopost
