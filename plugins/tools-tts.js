import fetch from 'node-fetch'

export const handler = async (m, { conn, args, usedPrefix, command }) => {
  const texto = args.join(' ')
  
  if (!texto) {
    return conn.reply(
      m.chat,
      `✳️ *Uso correcto:*\n${usedPrefix + command} <texto>\n\n📌 *Ejemplo:*\n${usedPrefix + command} Hola mundo`,
      m
    )
  }

  // Reacción inicial
  await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })

  try {
    // API de Google TTS vía Siputzx
    const url = `https://api.siputzx.my.id/api/tools/ttsgoogle?text=${encodeURIComponent(texto)}`
    const res = await fetch(url)

    if (!res.ok) throw new Error('Error en la respuesta del servidor')

    const arrayBuffer = await res.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Validación: Si el buffer es demasiado pequeño, probablemente no es un audio válido
    if (buffer.length < 100) throw new Error('Audio corrupto o demasiado corto')

    await conn.sendMessage(
      m.chat,
      {
        audio: buffer,
        mimetype: 'audio/mp4',
        ptt: true // Enviarlo como nota de voz
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error('Error en TTS:', e)
    
    // Intento de respaldo (Fallback) usando una API directa de Google
    try {
      const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(texto)}&tl=es&client=tw-ob`
      await conn.sendMessage(m.chat, { audio: { url: fallbackUrl }, mimetype: 'audio/mp4', ptt: true }, { quoted: m })
      await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
    } catch (err2) {
      await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
      conn.reply(m.chat, '❌ No se pudo generar el audio. Intenta más tarde.', m)
    }
  }
}

handler.help = ['tts']
handler.tags = ['tools']
handler.command = /^tts$/i

export default handler
