import axios from 'axios'
import delay from 'delay'

const canal = '120363409416185213@newsletter'

const queryStickers = [
  'memes', 'anime stickers', 'sasuke', 'naruto', 
  'graciosos', 'reacciones', 'gatos chistosos', 'flork'
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
    const { data } = await axios.get(`https://api.giphy.com/v1/stickers/search?api_key=5g7XG2u02V2LdE8Z7d7X8Xg7d8Z7d8Z7&q=${encodeURIComponent(keyword)}&limit=20`)
    const images = data?.data
    if (!images || images.length === 0) return []
    
    let pack = []
    for (let i = 0; i < cantidad; i++) {
      const random = images[Math.floor(Math.random() * images.length)]
      if (random && random.images?.fixed_height?.url) {
        pack.push(random.images.fixed_height.url)
      }
    }
    return pack
  } catch (e) {
    return []
  }
}

async function procesarYEnviarPack(conn, targetId, conSimulacion = false) {
  const packStickers = await obtenerPackStickers(5)
  const frase = frasesSasuke[Math.floor(Math.random() * frasesSasuke.length)]

  if (packStickers.length > 0) {
    if (conSimulacion) {
      await conn.sendPresenceUpdate('available', targetId)
      await delay(2000)
      await conn.sendPresenceUpdate('composing', targetId)
      await delay(4000)
    }

    await conn.sendMessage(targetId, { text: `📦 *𝙿𝙰𝙲𝙺 𝙳𝙴 𝚂𝚃𝙸𝙲𝙺𝙴𝚁𝚂 𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙾*\n\n${frase}` })
    await delay(3000)

    for (const stickerUrl of packStickers) {
      try {
        const response = await axios.get(stickerUrl, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data, 'binary')
        
        await conn.sendMessage(targetId, { 
          sticker: buffer,
          mimetype: 'image/webp'
        })
        await delay(1500)
      } catch (stErr) {
        console.error(stErr)
      }
    }
    
    if (conSimulacion) {
      await conn.sendPresenceUpdate('paused', targetId)
    }
    return true
  }
  return false
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
  console.log('🛡️ Sasuke Bot: Auto-Post de Packs de Stickers (Cada 8 min) Activo');

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
