import fetch from 'node-fetch'

let handler = async (m, { conn, text, command }) => {
  if (!text) return m.reply(`✨ *¿Qué pack buscamos hoy?*\nEjemplo: .${command} Messi`)

  try {
    // 1. Buscamos el pack
    const res = await fetch(`https://api.delirius.store/search/stickerly?query=${encodeURIComponent(text)}`)
    const json = await res.json()

    if (!json.status || !json.data.length) return m.reply('❌ No encontré ese pack.')

    // 2. Tomamos el primer pack encontrado
    const pack = json.data[0]
    const packUrl = pack.url // Esta es la URL de sticker.ly

    // 3. ENVIAR EL PACK (Esto genera el botón "Ver paquete de stickers")
    // Enviamos el link con un "adReply" para que se vea profesional y con diseño
    await conn.sendMessage(m.chat, {
      text: packUrl, // Al enviar el link directo, WA genera el botón
      contextInfo: {
        externalAdReply: {
          title: `🎁 PACK: ${pack.name}`,
          body: `Autor: ${pack.author} • 8 Stickers`,
          thumbnailUrl: pack.stickers[0] || '', 
          sourceUrl: packUrl,
          mediaType: 1,
          showAdAttribution: false,
          renderLargerThumbnail: true
        }
      }
    }, { quoted: m })

    // 4. Enviamos los 8 stickers sueltos por si el usuario no quiere abrir el link
    m.reply('🚀 *Cargando 8 stickers del pack...*')
    
    const dlRes = await fetch(`https://api.delirius.store/download/stickerly?url=${encodeURIComponent(packUrl)}`)
    const dlJson = await dlRes.json()
    const stickers = dlJson.data.stickers.slice(0, 8)

    for (let st of stickers) {
      await conn.sendMessage(m.chat, { 
        sticker: { url: st },
        contextInfo: { forwardedNewsletterMessageInfo: { newsletterJid: '120363232745145711@newsletter', newsletterName: 'Pack Sender' }} 
      }, { quoted: m })
    }

  } catch (e) {
    console.error(e)
    m.reply('⚠️ Error al obtener el paquete.')
  }
}

handler.help = ['stikerly']
handler.tags = ['sticker']
handler.command = /^(stikerly|sp|pack)$/i

export default handler
