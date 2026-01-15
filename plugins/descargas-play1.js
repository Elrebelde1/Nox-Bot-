// by WillZek
// código privado - Uchiha Edition
import fetch from 'node-fetch'
import yts from 'yt-search'
import { writeFileSync, unlinkSync, promises as fs } from 'fs'
import path from 'path'

const estados = {}
const TIEMPO_ESPERA = 120000

let handler = async (m, { conn, usedPrefix, command, text }) => {

  if (!text) return; // Silencioso sin texto

  const isLink = text.includes('youtube.com') || text.includes('youtu.be')
  let video

  try {
    if (isLink) {
      const videoId = text.split('v=')[1]?.split('&')[0] || text.split('/').pop()
      const search = await yts({ videoId })
      video = search
    } else {
      const search = await yts(text)
      video = search.videos[0]
    }

    if (!video) return; 
    
    await m.react("👁️");

    if (estados[m.sender]) clearTimeout(estados[m.sender].timeout)

    estados[m.sender] = {
      step: 'esperando_tipo',
      videoInfo: video,
      command,
      intentos: 0,
      timeout: setTimeout(() => delete estados[m.sender], TIEMPO_ESPERA)
    }

    const info = `
╭─〔 ♆ *Uᴄʜɪʜᴀ Pʟᴀʏᴇʀ* ♆ 〕─╮
│
│ 🗡️ *Tɪᴛᴜʟᴏ:* ${video.title}
│ 👤 *Aᴜᴛᴏʀ:* ${video.author.name}
│ ⏳ *Dᴜʀᴀᴄɪᴏɴ:* ${video.timestamp}
│ 👁️ *Vɪsᴛᴀs:* ${video.views.toLocaleString()}
│
╰─────────────────────╯

⛅ *¿Qᴜᴇ ᴅᴇsᴇᴀs ʜᴀᴄᴇʀ?*
Responde con:
1️⃣ *Para Audio (MP3)*
2️⃣ *Para Vídeo (MP4)*

🌑 *Eʟ ᴘᴏᴅᴇʀ sᴇ ᴇsᴛᴀ ᴄᴀɴᴀʟɪᴢᴀɴᴅᴏ...*`.trim();

    await conn.sendMessage(
      m.chat,
      { image: { url: video.thumbnail }, caption: info },
      { quoted: m }
    )
  } catch (e) {
    console.error(e)
  }
}

handler.before = async (m, { conn }) => {
  const estado = estados[m.sender]
  if (!estado || !m.text) return false

  const resp = m.text.trim()
  const isAudio = resp === '1' || resp === '1️⃣'
  const isVideo = resp === '2' || resp === '2️⃣'

  if (isAudio || isVideo) {
    clearTimeout(estado.timeout)
    const tipo = isAudio ? 'mp3' : 'mp4'
    
    await m.react("⏳");
    await m.reply(isAudio ? `🎧 *Canalizando audio...*` : `🎥 *Invocando video...*`);
    
    await enviarArchivo(m, conn, estado.videoInfo.url, tipo, estado.videoInfo.title)
    delete estados[m.sender]
    return true
  }

  return false
}

async function enviarArchivo(m, conn, url, tipo, titulo) {
  try {
    const apiURL = `https://optishield.uk/api/?type=youtubedl&apikey=c50919b9828c357cd81e753f03d4c000&url=${encodeURIComponent(url)}&video=${tipo === 'mp3' ? 0 : 1}`

    const res = await fetch(apiURL)
    const json = await res.json()

    if (!json?.result?.download) throw new Error('Falla de chakra')

    const buffer = await (await fetch(json.result.download)).buffer()
    const mimetype = tipo === 'mp3' ? 'audio/mpeg' : 'video/mp4'

    if (tipo === 'mp3') {
      await conn.sendMessage(m.chat, { audio: buffer, mimetype, fileName: `${titulo}.mp3` }, { quoted: m })
    } else {
      await conn.sendMessage(m.chat, { video: buffer, mimetype, fileName: `${titulo}.mp4`, caption: `⚡ *Destino cumplido.*` }, { quoted: m })
    }
    
    await m.react("✅");

  } catch (e) {
    // Fallback Vreden
    try {
      const vType = tipo === 'mp3' ? 'audio' : 'video'
      const vRes = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/${vType}?url=${encodeURIComponent(url)}&quality=128`)
      const vJson = await vRes.json()
      const dlUrl = vJson.result?.download?.url || vJson.result?.url

      if (dlUrl) {
        await conn.sendMessage(m.chat, { [tipo === 'mp3' ? 'audio' : 'video']: { url: dlUrl }, mimetype: tipo === 'mp3' ? 'audio/mpeg' : 'video/mp4' }, { quoted: m })
        await m.react("✅")
      } else {
        throw new Error()
      }
    } catch (err) {
      await m.reply(`❌ *El Genjutsu ha fallado. No se pudo descargar.*`)
    }
  }
}

handler.help = ['play']
handler.tags = ['descargas']
handler.command = ['play', 'musicdl']

export default handler
