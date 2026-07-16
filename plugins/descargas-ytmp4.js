import yts from 'yt-search'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🛸 *[ NOX BOT MD ]* 🌌\n\n🚩 *Ingresa un enlace de YouTube.*`)
  
  let res = await yts(text)
  let vid = res.videos[0]
  if (!vid) return m.reply(`⚠️ *No se encontró el video.*`)

  let apiUrl = `https://api.evogb.org/dl/ytmp4?url=${encodeURIComponent(vid.url)}&quality=720&key=sasuke`
  let json = await (await fetch(apiUrl)).json()
  if (!json.status) return m.reply(`❌ *Error al procesar el video.*`)

  let cap = `🛸 *[ NOX BOT MD ]* 🌌\n\n🎶 *Título:* ${vid.title}\n📁 *Formato:* MP4 (720p)\n\n⚙️ *Box Bot MD • Descargando...* 🌀`

  await conn.sendMessage(m.chat, { image: { url: vid.thumbnail }, caption: cap }, { quoted: m })
  await conn.sendMessage(m.chat, { video: { url: json.data.dl }, mimetype: 'video/mp4' }, { quoted: m })
}

handler.help = ['ytmp4 <url>']
handler.tags = ['downloader']
handler.command = /^ytmp4$/i

export default handler
