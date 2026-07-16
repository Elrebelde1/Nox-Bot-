import yts from 'yt-search'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🛸 *[ BOX BOT MD ]* 🌌\n\n🚩 *Ingresa un enlace de YouTube.*`)
  
  let res = await yts(text)
  let vid = res.videos[0]
  if (!vid) return m.reply(`⚠️ *No se encontró el video.*`)

  let apiUrl = `https://api.evogb.org/dl/ytmp3?url=${encodeURIComponent(vid.url)}&key=sasuke`
  let json = await (await fetch(apiUrl)).json()
  if (!json.status) return m.reply(`❌ *Error al procesar el audio.*`)

  let cap = `🛸 *[ Nox BOT MD ]* 🌌\n\n🎶 *Título:* ${vid.title}\n📁 *Formato:* MP3\n\n⚙️ *Nox Bot MD • Descargando...* 🌀`

  await conn.sendMessage(m.chat, { image: { url: vid.thumbnail }, caption: cap }, { quoted: m })
  await conn.sendMessage(m.chat, { audio: { url: json.data.dl }, mimetype: 'audio/mpeg' }, { quoted: m })
}

handler.help = ['ytmp3 <url>']
handler.tags = ['downloader']
handler.command = /^ytmp3$/i

export default handler
