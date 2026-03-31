import fetch from 'node-fetch'

export const handler = async (m, { conn, args, usedPrefix, command }) => {
  const texto = args.join(' ')
  if (!texto) throw `✳️ *Uso correcto:*\n${usedPrefix + command} <texto>`

  await conn.sendMessage(m.chat, { react: { text: '✍️', key: m.key } })

  try {
    // Usamos esta API que suele ser la más estable para archivos ogg/opus
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(texto)}&tl=es&client=tw-ob`
    
    const res = await fetch(url)
    if (!res.ok) throw new Error('Fallo al descargar audio')
    
    const buffer = await res.arrayBuffer()
    const audioBuffer = Buffer.from(buffer)

    await conn.sendMessage(
      m.chat,
      {
        audio: audioBuffer,
        fileName: `tts.opus`,
        mimetype: 'audio/ogg; codecs=opus', // ESTA ES LA CLAVE
        ptt: true
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    conn.reply(m.chat, '❌ El servidor de voz no responde. Intenta con un texto más corto.', m)
  }
}

handler.help = ['tts']
handler.tags = ['tools']
handler.command = /^tts$/i

export default handler
