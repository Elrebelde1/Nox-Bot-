import fetch from 'node-fetch'
import { Sticker } from 'wa-sticker-formatter'

let handler = async (m, { conn, text, command }) => {
  // Diseño y decoración de fuentes
  const d_title = (t) => `『 ⚡ *${t.toUpperCase()}* ⚡ 』`
  const d_body = (t) => ` ✨ _${t}_`

  if (!text) return m.reply(`✨ ${d_title('Buscador de Packs')}\n\n📌 *Ejemplo:* .${command} My Melody`)

  try {
    // Buscar packs en la API
    const searchRes = await fetch(`https://api.delirius.store/search/stickerly?query=${encodeURIComponent(text)}`)
    const searchJson = await searchRes.json()

    if (!searchJson.status || !Array.isArray(searchJson.data) || searchJson.data.length === 0) {
      return m.reply('🌀 *No se encontraron stickers para tu búsqueda.*')
    }

    // Elegir un pack aleatorio
    const pick = searchJson.data[Math.floor(Math.random() * searchJson.data.length)]
    const packName = pick.name || 'Premium Pack'
    const authorName = pick.author || 'AI Bot'

    // Mensaje decorado de aviso
    let info = `${d_title('Cargamento Localizado')}\n\n`
    info += `📦 *Pack:* ${packName}\n`
    info += `🎨 *Autor:* ${authorName}\n`
    info += `💎 *Cantidad:* 8 Stickers\n\n`
    info += `> ${d_body('Enviando paquete completo...')}`

    await m.reply(info)

    // Descargar stickers del pack
    const downloadRes = await fetch(`https://api.delirius.store/download/stickerly?url=${encodeURIComponent(pick.url)}`)
    const downloadJson = await downloadRes.json()

    if (!downloadJson.status || !downloadJson.data || !Array.isArray(downloadJson.data.stickers)) {
      return m.reply('⚠️ *No se pudo extraer el paquete.*')
    }

    // Seleccionamos 8 stickers
    const stickersToSend = downloadJson.data.stickers.slice(0, 8)

    // Envío del pack (uno tras otro rápidamente)
    for (let i = 0; i < stickersToSend.length; i++) {
      const sticker = new Sticker(stickersToSend[i], {
        pack: packName,
        author: authorName,
        type: 'full',
        categories: ['🔥', '✨'],
        id: `pack-${i}`
      })
      
      const buffer = await sticker.toBuffer()
      await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
      
      // Delay mínimo para que se sientan como un pack unido
      await new Promise(resolve => setTimeout(resolve, 300))
    }

  } catch (e) {
    console.error(e)
    m.reply('⚠️ *Hubo un error al procesar el pack de stickers.*')
  }
}

handler.help = ['stikerly <consulta>']
handler.tags = ['sticker']
handler.command = /^(stikerly|sp|pack)$/i

export default handler
