import * as googleTTS from 'google-tts-api'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  let q = m.quoted ? m.quoted : m
  let txt = text || q.text || q.caption || q.body || ''

  if (!txt) return m.reply(`🛸 *[ NOX BOT MD ]* 🌌\n\n🚩 *Escribe el texto que deseas convertir a audio.*\n📌 Ejemplo: *${usedPrefix + command} Hola, ¿cómo estás?*`)

  await m.react('🎙️')

  let lang = 'es'
  let url = googleTTS.getAudioUrl(txt, {
    lang: lang,
    slow: false,
    host: 'https://translate.google.com',
    timeout: 10000,
  })

  await conn.sendMessage(m.chat, {
    audio: { url: url },
    mimetype: 'audio/mpeg',
    ptt: true
  }, { quoted: m })

  await m.react('✅')
}

handler.help = ['tts <texto>']
handler.tags = ['tools']
handler.command = /^g?tts|ttss$/i

export default handler
