/**
 * 📂 COMANDO: Uchiha YouTube Play (Scraper Nativo)
 * 📝 DESCRIPCIÓN: Busca y descarga música usando yt-dlp directamente.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import { exec } from "child_process"
import yts from "yt-search"
import { promisify } from "util"
const execPromise = promisify(exec)

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
    const net = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"

    if (!text) return conn.reply(m.chat, `⚔️ *SISTEMA UCHIHA*\n\n> 🎵 *Escribe el nombre de la canción*\n> 🔗 *Ej:* ${usedPrefix + command} Feid Luna`, m)

    await m.react('🔍')

    try {
        let search = await yts(text)
        if (!search.videos[0]) return m.reply('❌ No se encontró el audio.')

        let video = search.videos[0]
        let link = video.url
        let title = video.title
        let thumbnail = video.thumbnail
        let duration = video.timestamp

        let report = `| 🎵 *𝖴𝖢𝖧𝖨𝖧𝖠 𝖯𝖫𝖠𝖸* 🎵\n`
        report += `|═══════════════════\n`
        report += `| 💿 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${title}\n`
        report += `| ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾́𝙽:* ${duration}\n`
        report += `| 📡 *𝚂𝚃𝙰𝚃𝚄𝚂:* ✅ Scraper Activo\n`
        report += `|═══════════════════\n`
        report += `| 🛠️ *${dev}*\n`
        report += `| ⛩️ *${net}*`

        await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: report }, { quoted: m })
        await m.react('⏳')

        const outputFilename = `/tmp/${video.videoId}.mp3`
        await execPromise(`yt-dlp -x --audio-format mp3 --audio-quality 0 -o "${outputFilename}" "${link}"`)

        await conn.sendMessage(m.chat, { 
            audio: { url: outputFilename }, 
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
        }, { quoted: m })

        await m.react('🔥')

    } catch (e) {
        await m.react('✖️')
    }
}

handler.help = ['play']
handler.tags = ['descargas']
handler.command = ['play3', 'play4']

export default handler
