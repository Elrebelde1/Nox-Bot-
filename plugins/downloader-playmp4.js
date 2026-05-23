/**
 * 📂 COMANDO: Uchiha YouTube Downloader
 * 📝 DESCRIPCIÓN: Extractor de audio de YouTube (MP3).
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * Usen los código porfa para traer más 
 * 🔗 API: https://api.evogb.org
 */

import fetch from "node-fetch"
import yts from "yt-search"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `⚔️ *SISTEMA UCHIHA*\n\n> 🔍 *Escribe el nombre de la canción*\n> 🔗 *Ej:* ${usedPrefix + command} Yan Block 444`, m)

    await m.react('🕒')

    try {
        let search = await yts(text)
        if (!search || !search.videos || search.videos.length === 0) {
            await m.react('❌')
            return m.reply('*No se encontraron resultados para tu búsqueda.*')
        }

        let videoUrl = search.videos[0].url
        let cmd = command.toLowerCase()
        const type = cmd === 'play4' ? 'ytmp4' : 'ytmp3'
        
        const b = (s) => Buffer.from(s, 'base64').toString('utf-8')
        const endpoint = b("aHR0cHM6Ly9hcGkuZGVsaXJpdXMuc3RvcmUvZG93bmxvYWQv")
        
        let queryUrl = `${endpoint}${type}?url=${encodeURIComponent(videoUrl)}`
        if (type === 'ytmp4') queryUrl += `&format=360p`

        let res = await fetch(queryUrl)
        let json = await res.json()

        if (!json.status || !json.data) {
            await m.react('❌')
            return m.reply('*Error al procesar la descarga con el servidor central.*')
        }

        const yt = json.data
        const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
        const net = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"

        let report = `| ⛩️ *𝖴𝖢𝖧𝖨𝖧𝖠 𝖯𝖫𝖠𝖸𝖤𝖱* ⛩️\n`
        report += `|═══════════════════\n`
        report += `| 💿 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${yt.title}\n`
        report += `| 👤 *𝙰𝚄𝚃𝙾𝚁:* ${yt.author}\n`
        report += `| 📦 *𝙵𝙾𝚁𝙼𝙰𝚃𝙾:* ${yt.format.toUpperCase()}\n`
        report += `|═══════════════════\n`
        report += `| 🛠️ *${dev}*\n`
        report += `| ⛩️ *${net}*`

        if (type === 'ytmp3') {
            await conn.sendMessage(m.chat, { 
                image: { url: yt.image }, 
                caption: report 
            }, { quoted: m })

            await conn.sendMessage(m.chat, { 
                audio: { url: yt.download }, 
                mimetype: 'audio/mpeg',
                fileName: `${yt.title}.mp3`
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                video: { url: yt.download }, 
                caption: report,
                mimetype: 'video/mp4'
            }, { quoted: m })
        }

        await m.react('🔥')

    } catch (e) {
        await m.react('❌')
    }
}

handler.help = ['play3', 'play4']
handler.tags = ['downloader']
handler.command = /^(play3|play4)$/i

export default handler
