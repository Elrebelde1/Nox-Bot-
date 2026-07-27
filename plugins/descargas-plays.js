import yts from 'yt-search'
import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'
import fs from 'fs'
import path from 'path'
import { tmpdir } from 'os'

let handler = async (m, { conn, command, text, usedPrefix }) => {
  if (!text) return m.reply(`🛸 *[ NOX BOT MD ]* 🌌\n\n🚩 *Escribe el nombre de lo que deseas buscar.*\n📌 Ejemplo: *${usedPrefix + command} king nasir*`)

  await m.react('🔍')

  let res = await yts(text)
  let vid = res.videos[0]
  if (!vid) {
    await m.react('❌')
    return m.reply(`⚠️ *No se encontraron resultados.*`)
  }

  await m.react('⏳')

  let isVideo = command === 'play2'
  let apiUrl = isVideo 
    ? `https://api.evogb.org/dl/ytmp4?url=${encodeURIComponent(vid.url)}&quality=720&key=sasuke` 
    : `https://api.evogb.org/dl/ytmp3?url=${encodeURIComponent(vid.url)}&key=sasuke`

  let json = await (await fetch(apiUrl)).json()
  if (!json.status) {
    await m.react('❌')
    return m.reply(`❌ *Error al procesar la descarga.*`)
  }

  let cap = `🛸 *[ NOX BOT MD ]* 🌌\n\n`
  cap += `🎶 *Título:* ${vid.title}\n`
  cap += `⏳ *Duración:* ${vid.timestamp}\n`
  cap += `👤 *Autor:* ${vid.author.name}\n`
  cap += `📁 *Formato:* ${isVideo ? 'VIDEO (MP4)' : 'AUDIO (MP3)'}\n\n`
  cap += `⚙️ *NOX Bot MD • Procesando con FFmpeg...* 🌀`

  await conn.sendMessage(m.chat, { image: { url: vid.thumbnail }, caption: cap }, { quoted: m })

  let ext = isVideo ? 'mp4' : 'mp3'
  let tmpFilePath = path.join(tmpdir(), `${Date.now()}.${ext}`)

  await new Promise((resolve, reject) => {
    let process = ffmpeg(json.data.dl)
    if (isVideo) {
      process
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .outputOptions(['-movflags +faststart', '-pix_fmt yuv420p'])
    } else {
      process
        .audioCodec('libmp3lame')
        .format('mp3')
    }

    process
      .on('end', () => resolve(true))
      .on('error', (err) => reject(err))
      .save(tmpFilePath)
  })

  let mediaBuffer = fs.readFileSync(tmpFilePath)

  await conn.sendMessage(m.chat, { 
    [isVideo ? 'video' : 'audio']: mediaBuffer, 
    mimetype: isVideo ? 'video/mp4' : 'audio/mpeg' 
  }, { quoted: m })

  if (fs.existsSync(tmpFilePath)) fs.unlinkSync(tmpFilePath)

  await m.react('✅')
}

handler.help = ['play', 'play2'].map(v => v + ' <búsqueda>')
handler.tags = ['downloader']
handler.command = /^(play|play2)$/i

export default handler
