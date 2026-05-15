/**
 * 📂 COMANDO: Uchiha YouTube Play (Scraper Wrapper)
 * 📝 DESCRIPCIÓN: Busca y descarga música usando yt-dlp-wrap de forma limpia.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import YTDlpWrap from "yt-dlp-wrap"
import yts from "yt-search"
import fs from "fs"

const ytDlpWrap = new YTDlpWrap()

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

        let report = `| 🎵 *𝖴𝖢𝖧𝖨𝖧𝖠 𝖯𝖫𝙰𝖸* 🎵\n` +
                    `|═══════════════════\n` +
                    `| 💿 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${title}\n` +
                    `| ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾́𝙽:* ${duration}\n` +
                    `| 📡 *𝚂𝚃𝙰𝚃𝚄𝚂:* ✅ Scraper Wrapper\n` +
                    `|═══════════════════\n` +
                    `| 🛠️ *${dev}*\n` +
                    `| ⛩️ *${net}*`

        await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: report }, { quoted: m })
        await m.react('⏳')

        const outputFilename = `./${video.videoId}.mp3`

        await ytDlpWrap.execPromise([
            link,
            "-x",
            "--audio-format", "mp3",
            "--audio-quality", "0",
            "-o", outputFilename
        ])

        await conn.sendMessage(m.chat, { 
            audio: { url: outputFilename }, 
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`
        }, { quoted: m })

        if (fs.existsSync(outputFilename)) fs.unlinkSync(outputFilename)
        await m.react('🔥')

    } catch (e) {
        await m.react('✖️')
    }
}

handler.help = ['play']
handler.tags = ['descargas']
handler.command = ['play3']

export default handler
