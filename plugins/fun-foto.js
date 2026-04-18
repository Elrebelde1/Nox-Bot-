import fetch from 'node-fetch'

/**
 * 🚀 STICKER-PACK CATALOG SENDER
 * Re-diseñado para enviar paquetes completos estilo WhatsApp Official
 */

let handler = async (m, { conn, text, command, usedPrefix }) => {
  // Estética de decoración
  const decoration = `✨ ━━━ 『 **PACK EXPLORER** 』 ━━━ ✨`

  if (!text) return conn.sendMessage(m.chat, { 
    text: `${decoration}\n\n💡 *Escribe el nombre del pack que buscas.*\nEjemplo: *${usedPrefix + command} Among Us*` 
  }, { quoted: m })

  try {
    // 🔍 Buscando en la API
    const searchRes = await fetch(`https://api.delirius.store/search/stickerly?query=${encodeURIComponent(text)}`)
    const searchJson = await searchRes.json()

    if (!searchJson.status || !searchJson.data?.length) {
      return m.reply('🌀 *No se encontró ningún paquete con ese nombre.*')
    }

    // Elegimos el primer resultado o uno aleatorio
    const pack = searchJson.data[0]
    
    // 📥 Obtenemos la información extendida del pack para obtener el ID de Sticker.ly
    const dlRes = await fetch(`https://api.delirius.store/download/stickerly?url=${encodeURIComponent(pack.url)}`)
    const dlJson = await dlRes.json()

    if (!dlJson.status) return m.reply('❌ *Error al procesar el catálogo.*')

    // 🎨 DISEÑO DEL MENSAJE DE CATÁLOGO
    // Nota: Para que aparezca como en la imagen, enviamos el pack directamente
    
    await conn.sendMessage(m.chat, {
      text: `📦 *PAQUETE ENCONTRADO*\n\n✨ *Título:* ${pack.name}\n👤 *Autor:* ${pack.author}\n📝 *Stickers:* 8 seleccionados\n\n> Presiona el botón de abajo para verlos todos.`,
      contextInfo: {
        externalAdReply: {
          title: pack.name,
          body: `By: ${pack.author}`,
          thumbnailUrl: dlJson.data.stickers[0], // Usamos el primer sticker como portada
          sourceUrl: pack.url,
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    // 🚀 ENVÍO DEL PACK (Método para que aparezca "Ver paquete de stickers")
    // Usamos el método de envío de archivos de WhatsApp con el mimetype específico
    await conn.sendMessage(m.chat, {
      sticker: { url: dlJson.data.stickers[0] }, // Portada
      isPackage: true,
      packname: pack.name,
      author: pack.author,
      // Aquí enviamos el array de los primeros 8 para la previsualización
      stickers: dlJson.data.stickers.slice(0, 8) 
    }, { quoted: m })

  } catch (error) {
    console.error(error)
    m.reply('⚠️ *Hubo un fallo al conectar con la base de stickers.*')
  }
}

handler.help = ['pack <nombre>']
handler.tags = ['sticker']
handler.command = /^(pack|stikerly|sp)$/i // Ahora también responde a -sp como en tu imagen

export default handler
