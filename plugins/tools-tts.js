import fetch from 'node-fetch'
import { toAudio } from '../lib/converter.js' // Usamos tu convertidor para asegurar compatibilidad

export const handler = async (m, { conn, args, usedPrefix, command }) => {
  const texto = args.join(' ')
  if (!texto) throw `✳️ *Uso correcto:*\n${usedPrefix + command} <texto>`

  await conn.sendMessage(m.chat, { react: { text: '✍️', key: m.key } })

  try {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(texto)}&tl=es&client=tw-ob`

    const res = await fetch(url)
    if (!res.ok) throw new Error('Fallo al descargar audio')

    const buffer = Buffer.from(await res.arrayBuffer())
    
    // PASO CLAVE: Convertimos el buffer de Google a un formato que WhatsApp adore
    const audio = await toAudio(buffer, 'mp4') 

    if (!audio.data) throw new Error('Error en la conversión')

    await conn.sendMessage(
      m.chat,
      {
        audio: audio.data,
        mimetype: 'audio/ogg; codecs=opus',
        ptt: true
      },
      { quoted: m }
    )

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

  } catch (e) {
    console.error(e)
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    m.reply('❌ No se pudo generar el audio. Intenta de nuevo.')
  }
}

handler.help = ['tts']
handler.tags = ['tools']
handler.command = /^tts$/i

export default handler
