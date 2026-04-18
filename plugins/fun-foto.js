import fetch from 'node-fetch'
import { Sticker, StickerTypes } from 'wa-sticker-formatter'

/**
 * ⚡ STICKER-PACK EXPLORER ⚡
 * Rediseñado por Gemini
 */

let handler = async (m, { conn, text, command, usedPrefix }) => {
  // Diseño de fuentes personalizadas (Simulado con Unicode)
  const f_title = (txt) => `『 ⚡ *${txt.toUpperCase()}* ⚡ 』`
  const f_fancy = (txt) => `✨ _${txt}_`

  if (!text) return conn.sendMessage(m.chat, { 
    text: `✨ *『 INTERFAZ DE STICKERS 』*\n\n🍭 *Uso:* ${usedPrefix + command} <nombre>\n🚀 *Ejemplo:* ${usedPrefix + command} Anime` 
  }, { quoted: m })

  try {
    // 🔍 Búsqueda avanzada
    const searchRes = await fetch(`https://api.delirius.store/search/stickerly?query=${encodeURIComponent(text)}`)
    const searchJson = await searchRes.json()

    if (!searchJson.status || !searchJson.data?.length) {
      return m.reply('🌀 *No se hallaron tesoros en la base de datos.*')
    }

    // Selección aleatoria del catálogo
    const selection = searchJson.data[Math.floor(Math.random() * searchJson.data.length)]
    
    // 📥 Descarga del cargamento (Pack Completo)
    const dlRes = await fetch(`https://api.delirius.store/download/stickerly?url=${encodeURIComponent(selection.url)}`)
    const dlJson = await dlRes.json()

    if (!dlJson.status || !dlJson.data?.stickers) {
      return m.reply('❌ *Error al extraer el cargamento.*')
    }

    // Configuración del envío (8 stickers)
    const pack = dlJson.data.stickers.slice(0, 8)
    
    // Notificación con diseño
    let report = `${f_title('Pack Localizado')}\n\n`
    report += `📦 *Nombre:* ${selection.name || 'Premium Pack'}\n`
    report += `🎨 *Creador:* ${selection.author || 'Artist'}\n`
    report += `💎 *Cantidad:* 8 stickers seleccionados\n\n`
    report += `> _Preparando el envío, por favor espere..._`

    await conn.sendMessage(m.chat, { text: report }, { quoted: m })

    // 🚀 Bucle de procesado y envío masivo
    for (const url of pack) {
      const sticker = new Sticker(url, {
        pack: `Stickerly - ${selection.name}`, 
        author: 'Gemini AI',
        type: StickerTypes.FULL,
        categories: ['💎', '✨', '🔥'],
        quality: 70 
      })

      const buffer = await sticker.toBuffer()
      await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
      
      // Pequeño delay para no saturar el chat (opcional)
      await new Promise(resolve => setTimeout(resolve, 500))
    }

  } catch (error) {
    console.log(error)
    m.reply('⚠️ *Surgió un inconveniente en el servidor de arte.*')
  }
}

handler.help = ['stpack <query>']
handler.tags = ['premium']
handler.command = /^(stikerly|stpack|packly)$/i

export default handler
