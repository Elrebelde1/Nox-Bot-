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
    const { data } = await axios.get(`https://api.delirius.store/search/stickerly?q=${encodeURIComponent(keyword)}`)
    if (!data || !data.status || !data.data || data.data.length === 0) return []
    
    const packAleatorio = data.data[Math.floor(Math.random() * data.data.length)]
    if (!packAleatorio || !packAleatorio.preview) return []

    let stickersUrls = []
    const basePreview = packAleatorio.preview
    
    if (basePreview.includes('/sticker_pack/')) {
      const parts = basePreview.split('/')
      const packId = parts[parts.indexOf('sticker_pack') + 1]
      const subId = parts[parts.indexOf('sticker_pack') + 2]
      
      for (let i = 1; i <= cantidad; i++) {
        stickersUrls.push(`https://stickerly.pstatic.net/sticker_pack/${packId}/${subId}/${i}/${i}.png`)
      }
    } else {
      stickersUrls.push(basePreview)
    }

    return {
      nombre: packAleatorio.name,
      autor: packAleatorio.author,
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
  await delay(3000)

  for (const stickerUrl of packInfo.urls) {
    try {
      const response = await axios.get(stickerUrl, { responseType: 'arraybuffer' }).catch(() => null)
      if (!response) continue
      
      const buffer = Buffer.from(response.data, 'binary')
      await conn.sendMessage(targetId, { 
        sticker: buffer,
        mimetype: 'image/webp'
      })
      await delay(2000)
    } catch (stErr) {
      console.error(stErr)
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
  console.log('🛡️ Sasuke Bot: Auto-Post de Sticker.ly (Cada 8 min) Activo');

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
