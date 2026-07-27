import * as googleTTS from 'google-tts-api'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'

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

  let tmpFilePath = path.join(tmpdir(), `${Date.now()}.opus`)

  await new Promise((resolve, reject) => {
    ffmpeg(url)
      .audioCodec('libopus')
      .toFormat('opus')
      .outputOptions([
        '-avoid_negative_ts make_zero',
        '-ac 1',
        '-b:a 64k'
      ])
      .on('end', () => resolve(true))
      .on('error', (err) => reject(err))
      .save(tmpFilePath)
  })

  let audioBuffer = fs.readFileSync(tmpFilePath)

  await conn.sendMessage(m.chat, {
    audio: audioBuffer,
    mimetype: 'audio/ogg; codecs=opus',
    ptt: true
  }, { quoted: m })

  if (fs.existsSync(tmpFilePath)) fs.unlinkSync(tmpFilePath)

  await m.react('✅')
}

handler.help = ['tts <texto>']
handler.tags = ['tools']
handler.command = /^g?tts|ttss$/i

export default handler
