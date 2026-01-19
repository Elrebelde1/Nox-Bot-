import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command }) => {
await m.react('🕓')
try {
let res = await fetch('https://api.waifu.pics/sfw/waifu')
if (!res.ok) return
let json = await res.json()
if (!json.url) return 
await conn.sendFile(m.chat, json.url, 'thumbnail.jpg', listo, m, null, rcanal)
await m.react('✅')
} catch {
await m.react('✖️')
}}
handler.help = ['waifu']
handler.tags = ['search']
handler.command = ['waifu']
//handler.limit = 1
handler.register = true


export default handler