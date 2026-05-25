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

async function obtenerPackStickers(cantidad = 5) {
  const keyword = queryStickers[Math.floor(Math.random() * queryStickers.length)]
  try {
    const searchRes = await axios.get(`https://api.delirius.store/search/stickerly?query=${encodeURIComponent(keyword)}`)
    if (!searchRes.data || !searchRes.data.status || !searchRes.data.data || searchRes.data.data.length === 0) return null
    
    const packAleatorio = searchRes.data.data[Math.floor(Math.random() * searchRes.data.data.length)]
    if (!packAleatorio || !packAleatorio.url) return null

    const downloadRes = await axios.get(`https://api.delirius.store/download/stickerly?url=${encodeURIComponent(packAleatorio.url)}`)
    if (!downloadRes.data || !downloadRes.data.status || !downloadRes.data.data || !downloadRes.data.data.stickers) return null

    const allStickers = downloadRes.data.data.stickers
    let stickersUrls = []
    
    for (let i = 0; i < Math.min(cantidad, allStickers.length); i++) {
      stickersUrls.push(allStickers[i])
    }

    return {
      nombre: downloadRes.data.data.name || packAleatorio.name,
      autor: downloadRes.data.data.author || packAleatorio.author,
      urls: stickersUrls
    }
  } catch (e) {
    return null
  }
}

async function procesarYEnviarPack(conn, targetId, conSimulacion = false) {
  const packInfo = await obtenerPackStickers(5)
  if (!packInfo || packInfo.urls.length === 0) return false

  const frase = frasesSasuke[Math.floor(Math.random() * frasesSasuke.length)]

  if (conSimulacion) {
    await conn.sendPresenceUpdate('available', targetId)
    await delay(2000)
    await conn.sendPresenceUpdate('composing', targetId)
    await delay(4000)
  }

  let caption = `📦 *𝙿𝙰𝙲𝙺:* ${packInfo.nombre}\n`
  caption += `👤 *𝙰𝚄𝚃𝙾𝚁:* ${packInfo.autor}\n\n`
  caption += `${frase}\n\n`
  caption += `By Barboza-Team ⚡\nCode creado por Barboza Developer x Zona Developers`

  await conn.sendMessage(targetId, { text: caption })
  // Esperar un momento a que el texto base se asiente en el canal antes de saturar con archivos
  await delay(4000) 

  for (const stickerUrl of packInfo.urls) {
    try {
      const response = await axios.get(stickerUrl, { responseType: 'arraybuffer' }).catch(() => null)
      if (!response) continue
      
      const buffer = Buffer.from(response.data, 'binary')
      
      await conn.sendMessage(targetId, { 
        sticker: buffer,
        mimetype: 'image/webp'
      })
      
      // Incrementamos el delay a 3.5 segundos entre sticker y sticker para asegurar la subida completa a los servidores de WhatsApp
      await delay(3500) 
    } catch (stErr) {
      console.error('Error al subir sticker individual:', stErr)
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
    const exito = await procesarYEnviarPack(conn, targetId, command === 'packcf')
    if (exito) {
      if (command === 'packcf' && m.react) await m.react("✅")
    } else {
      return m.reply('《✧》 No se pudo generar el pack de stickers en este momento.')
    }
  } catch (e) {
    console.error(e)
    if (command === 'packcf' && m.react) await m.react("❌")
    return m.reply('《✧》 Ocurrió un error al enviar el pack.')
  }
}

handler.init = async (conn) => {
  console.log('🛡️ Sasuke Bot: Auto-Post de Sticker.ly Completo (Cada 8 min) Activo');

  while (true) {
    try {
      await procesarYEnviarPack(conn, canal, true)
      const tiempoEspera = 8 * 60 * 1000;
      await delay(tiempoEspera);
    } catch (err) {
      console.error('Error en el loop automático de stickers:', err)
      await delay(30000); 
    }
  }
}

handler.help = ['packsticker', 'packcf']
handler.tags = ['sticker']
handler.command = ['packsticker', 'packcf']
handler.rowner = true

export default handler
