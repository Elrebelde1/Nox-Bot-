import fetch from 'node-fetch'

export const handler = async (m, { conn, args, usedPrefix, command }) => {
  const texto = args.join(' ')
  if (!texto) throw `✳️ *Uso correcto:*\n${usedPrefix + command} <texto>`

  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    // Usamos la URL directa de Google para asegurar compatibilidad total
    const s_gtts = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(texto)}&tl=es&client=tw-ob`
    
    await conn.sendMessage(m.chat, { 
        audio: { url: s_gtts }, 
        fileName: 'tts.mp3', 
        mimetype: 'audio/mpeg', // Cambiado a mpeg para que WhatsApp lo procese mejor
        ptt: true 
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    // Segundo intento si el primero falla
    try {
        let res = `https://api.siputzx.my.id/api/tools/ttsgoogle?text=${encodeURIComponent(texto)}`
        await conn.sendFile(m.chat, res, 'tts.opus', null, m, true)
    } catch (err) {
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    }
  }
}

handler.help = ['tts']
handler.tags = ['tools']
handler.command = /^tts$/i

export default handler
