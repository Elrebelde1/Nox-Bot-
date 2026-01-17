import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
try {
if (!text.trim()) return conn.reply(m.chat, `❀ Por favor, ingresa el nombre de la música a descargar.`, m)
await m.react('🕒')
const videoMatch = text.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/|v\/))([a-zA-Z0-9_-]{11})/)
const query = videoMatch ? 'https://youtu.be/' + videoMatch[1] : text
const search = await yts(query)
const result = videoMatch ? search.videos.find(v => v.videoId === videoMatch[1]) || search.all[0] : search.all[0]
if (!result) throw 'ꕥ No se encontraron resultados.'
const { title, thumbnail, timestamp, views, ago, url, author, seconds } = result
if (seconds > 3600) throw '⚠ El contenido supera el límite de duración.'
const vistas = formatViews(views)

// DISEÑO UCHIHA APLICADO A LA INFORMACIÓN
const info = `
╭─〔 ♆ *Uᴄʜɪʜᴀ Pʟᴀʏᴇʀ* ♆ 〕─╮
│
│ 🗡️ *Tɪᴛᴜʟᴏ:* ${title}
│ 👤 *Aᴜᴛᴏʀ:* ${author.name}
│ ⏳ *Dᴜʀᴀᴄɪᴏɴ:* ${timestamp}
│ 👁️ *Vɪsᴛᴀs:* ${vistas}
│ ☁︎ *Pᴜʙʟɪᴄᴀᴅᴏ:* ${ago}
│ ➪ *Lɪɴᴋ:* ${url}
│
╰─────────────────────╯

🌑 *Eʟ ᴘᴏᴅᴇʀ sᴇ ᴇsᴛᴀ ᴄᴀɴᴀʟɪᴢᴀɴᴅᴏ...*`.trim()

const thumb = (await conn.getFile(thumbnail)).data
await conn.sendMessage(m.chat, { image: thumb, caption: info }, { quoted: m })

if (['play', 'yta', 'ytmp3', 'playaudio'].includes(command)) {
const audio = await getAud(url)
if (!audio?.url) throw '⚠ No se pudo obtener el audio.'
m.reply(`> ❀ *Audio procesado. Servidor:* \`${audio.api}\``)
await conn.sendMessage(m.chat, { audio: { url: audio.url }, fileName: `${title}.mp3`, mimetype: 'audio/mpeg' }, { quoted: m })
await m.react('✔️')
} else if (['play2', 'ytv', 'ytmp4', 'mp4'].includes(command)) {
const video = await getVid(url)
if (!video?.url) throw '⚠ No se pudo obtener el video.'
m.reply(`> ❀ *Vídeo procesado. Servidor:* \`${video.api}\``)
await conn.sendFile(m.chat, video.url, `${title}.mp4`, `> ❀ ${title}\n⚡ *Destino cumplido.*`, m)
await m.react('✔️')
}} catch (e) {
await m.react('✖️')
return conn.reply(m.chat, typeof e === 'string' ? e : '⚠︎ Se ha producido un problema.\n' + e.message, m)
}}

handler.command = handler.help = ['play', 'yta', 'ytmp3', 'play2', 'ytv', 'ytmp4', 'playaudio', 'mp4']
handler.tags = ['descargas']
handler.group = true

export default handler

async function getAud(url) {
const apis = [
{ api: 'Optishield', endpoint: `https://optishield.uk/api/?type=youtubedl&apikey=c50919b9828c357cd81e753f03d4c000&url=${encodeURIComponent(url)}&video=0`, extractor: res => res.result?.download },
{ api: 'Vreden', endpoint: `https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(url)}&quality=128`, extractor: res => res.result?.download?.url || res.result?.url },
{ api: 'Adonix', endpoint: `${global.APIs.adonix.url}/download/ytaudio?apikey=${global.APIs.adonix.key}&url=${encodeURIComponent(url)}`, extractor: res => res.data?.url }
]
return await fetchFromApis(apis)
}

async function getVid(url) {
const apis = [
{ api: 'Optishield', endpoint: `https://optishield.uk/api/?type=youtubedl&apikey=c50919b9828c357cd81e753f03d4c000&url=${encodeURIComponent(url)}&video=1`, extractor: res => res.result?.download },
{ api: 'Vreden', endpoint: `https://api.vreden.my.id/api/v1/download/youtube/video?url=${encodeURIComponent(url)}&quality=360`, extractor: res => res.result?.download?.url || res.result?.url },
{ api: 'Adonix', endpoint: `${global.APIs.adonix.url}/download/ytvideo?apikey=${global.APIs.adonix.key}&url=${encodeURIComponent(url)}`, extractor: res => res.data?.url }
]
return await fetchFromApis(apis)
}

async function fetchFromApis(apis) {
for (const { api, endpoint, extractor } of apis) {
try {
const controller = new AbortController()
const timeout = setTimeout(() => controller.abort(), 12000)
const res = await fetch(endpoint, { signal: controller.signal }).then(r => r.json())
clearTimeout(timeout)
const link = extractor(res)
if (link) return { url: link, api }
} catch (e) {}
}
return null
}

function formatViews(views) {
if (views === undefined) return "No disponible"
if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
return views.toString()
}
