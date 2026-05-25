import axios from 'axios'
import delay from 'delay'

const canal = '120363409416185213@newsletter'

const queryStickers = [
  'memes', 'sasuke uchiha', 'naruto', 'graciosos', 
  'reacciones', 'gatos chistosos', 'flork', 'anime sticker'
]

const frasesSasuke = [
  '🐍 El camino de la venganza es solitario...',
  '👁️ Solo aquellos que sufren entienden la verdadera paz.',
  '⚡ Chidori!',
  '🔥 No me importa lo que piensen los demás.',
  '🌀 El Sharingan lo ve todo.'
]

// Obtiene un grupo de 3 o 4 stickers variados de un pack aleatorio
async function obtenerVariedadStickers() {
  const keyword = queryStickers[Math.floor(Math.random() * queryStickers.length)]
  // Define aleatoriamente si enviará 3 o 4 stickers en este turno
  const cantidadStickers = Math.floor(Math.random() * 2) + 3 

  try {
    const searchRes = await axios.get(`https://api.delirius.store/search/stickerly?query=${encodeURIComponent(keyword)}`)
    if (!searchRes.data || !searchRes.data.status || !searchRes.data.data || searchRes.data.data.length === 0) return null
    
    const packAleatorio = searchRes.data.data[Math.floor(Math.random() * searchRes.data.data.length)]
    if (!packAleatorio || !packAleatorio.url) return null

    const downloadRes = await axios.get(`https://api.delirius.store/download/stickerly?url=${encodeURIComponent(packAleatorio.url)}`)
    if (!downloadRes.data || !downloadRes.data.status || !downloadRes.data.data || !downloadRes.data.data.stickers) return null

    const allStickers = downloadRes.data.data.stickers
    if (allStickers.length === 0) return null

    // Mezclar el array de stickers para asegurar variedad si el pack es grande
    const stickersMezclados = allStickers.sort(() => 0.5 - Math.random())
    let stickersUrls = []
    
    for (let i = 0; i < Math.min(cantidadStickers, stickersMezclados.length); i++) {
      stickersUrls.push(stickersMezclados[i])
    }

    return {
      nombre: downloadRes.data.data.name || packAleatorio.name,
      autor: downloadRes.data.data.author || packAleatorio.author,
      urls: stickersUrls
    }
  } catch (e) {
    console.error('Error al obtener variedad de stickers:', e.message)
    return null
  }
}

// Procesa y envía el grupo de stickers de forma estable
async function procesarYEnviarVariedad(conn, targetId, conSimulacion = false) {
  const packInfo = await obtenerVariedadStickers()
  if (!packInfo || packInfo.urls.length === 0) return false

  const frase = frasesSasuke[Math.floor(Math.random() * frasesSasuke.length)]

  if (conSimulacion) {
    await conn.sendPresenceUpdate('available', targetId)
    await delay(1500)
    await conn.sendPresenceUpdate('composing', targetId)
    await delay(2500)
  }

  let caption = `📦 *𝙿𝙰𝙲𝙺:* ${packInfo.nombre}\n`
  caption += `👤 *𝙰𝚄𝚃𝙾𝚁:* ${packInfo.autor}\n\n`
  caption += `${frase}\n\n`
  caption += `By Barboza-Team ⚡\nCode creado por Barboza Developer x Zona Developers`

  // Enviar el texto informativo primero
  await conn.sendMessage(targetId, { text: caption })
  await delay(3000) 

  // Enviar la variedad de 3 o 4 stickers con pausa entre ellos para que carguen bien
  for (const stickerUrl of packInfo.urls) {
    try {
      const response = await axios.get(stickerUrl, { responseType: 'arraybuffer' }).catch(() => null)
      if (!response) continue
      
      const buffer = Buffer.from(response.data, 'binary')
      await conn.sendMessage(targetId, { 
        sticker: buffer,
        mimetype: 'image/webp'
      })
      await delay(3500) // Pausa de 3.5 segundos para evitar el error de carga
    } catch (stErr) {
      console.error('Error enviando sticker de la variedad:', stErr.message)
    }
  }
  
  if (conSimulacion) {
    await conn.sendPresenceUpdate('paused', targetId)
  }
  return true
}

var handler = async (m, { conn, command }) => {
  const targetId = command === 'packcf' ? canal : m.chat
  if (command === 'packcf' && m.react) await m.react("🔄")

  try {
    const exito = await procesarYEnviarVariedad(conn, targetId, command === 'packcf')
    if (exito) {
      if (command === 'packcf' && m.react) await m.react("✅")
    } else {
      return m.reply('《✧》 No se pudo generar la variedad de stickers en este momento.')
    }
  } catch (e) {
    console.error(e)
    if (command === 'packcf' && m.react) await m.react("❌")
    return m.reply('《✧》 Ocurrió un error al procesar el comando.')
  }
}

// Bucle automático en segundo plano configurado para cada 20 minutos
handler.init = async (conn) => {
  console.log('🛡️ Sasuke Bot: Auto-Post de Variedad (3-4 Stickers cada 20 min) Activo');

  while (true) {
    try {
      await procesarYEnviarVariedad(conn, canal, true)
      
      // Espera exacta de 20 minutos (20 minutos * 60 segundos * 1000 milisegundos)
      const tiempoEspera = 20 * 60 * 1000
      await delay(tiempoEspera)
    } catch (err) {
      console.error('Error en el loop automático de 20 minutos:', err)
      await delay(30000) // Reintento rápido en 30 segundos si hay caída de red
    }
  }
}

handler.help = ['packsticker', 'packcf']
handler.tags = ['sticker']
handler.command = ['packsticker', 'packcf']
handler.rowner = true

export default handler
