import hispamemes from 'hispamemes'
import axios from 'axios'
import delay from 'delay'

const canal = '120363409416185213@newsletter'

const query = [
  'videos graciosos', 'memes random', 'funny tik tok',
  'carros edits', 'edits series phonk', 'memes de risa'
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
    // 1. Simula que el bot está "conectado"
    await conn.sendPresenceUpdate('available', canal)
    await delay(2000)
    
    // 2. Simula que está "subiendo" o "escribiendo"
    await conn.sendPresenceUpdate('composing', canal)
    await delay(5000) // Tiempo de espera para parecer humano

    await conn.sendMessage(canal, contenido)
    
    // 3. Quita el estado de "escribiendo"
    await conn.sendPresenceUpdate('paused', canal)
  } catch (e) { console.error('Error en envío:', e) }
}

async function autopost(conn) {
  console.log('🛡️ Sistema Anti-Baneo Activo para Sasuke Bot')

  while (true) {
    try {
      const tipo = Math.random() < 0.5 ? 'meme' : 'video'

      if (tipo === 'meme') {
        const meme = await hispamemes.meme()
        if (meme) {
          await enviarConSimulacion(conn, {
            image: { url: meme },
            caption: '🌟 Contenido del día'
          })
        }
      } else {
        const video = await obtenerVideo()
        if (video?.url) {
          await enviarConSimulacion(conn, {
            video: { url: video.url },
            caption: video.title || '🔥 Check esto'
          })
        }
      }

      // --- ESTRATEGIA DE TIEMPOS DINÁMICOS ---
      // En lugar de 15 min fijos, usamos un rango entre 20 y 45 minutos.
      // Los patrones fijos son la causa #1 de baneos.
      const min = 20;
      const max = 45;
      const esperaAleatoria = Math.floor(Math.random() * (max - min + 1) + min) * 60 * 1000;
      
      console.log(`🕒 Patrón aleatorio: Siguiente post en ${esperaAleatoria / 60000} minutos.`);
      await delay(esperaAleatoria);

    } catch (err) {
      await delay(120000); // Si falla, espera 2 minutos
    }
  }
}

export default autopost
