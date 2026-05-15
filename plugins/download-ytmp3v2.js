/**
 * 📂 COMANDO: Uchiha Audio Downloader
 * 📝 DESCRIPCIÓN: Extractor de audio MP3 de alta calidad.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔗 API: https://sylphyy.xyz/download/v2/ytmp3
 */

import fetch from "node-fetch"
import yts from 'yt-search'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
    const net = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"

    if (!text) return conn.reply(m.chat, `⚔️ *SISTEMA UCHIHA*\n\n> 🎵 *Escribe el nombre del audio*\n> 🔗 *Ej:* ${usedPrefix + command} Lose Yourself`, m)

    await m.react('💿')

    try {
        const decode = (s) => Buffer.from(s, 'base64').toString('utf-8')
        const endpoint = decode("aHR0cHM6Ly9zeWxwaHl5Lnh5ei9kb3dubG9hZC92Mi95dG1wMw==")
        const key = decode("c3lscGh5LTZmMTUwZA==")

        let search = await yts(text)
        if (!search.videos[0]) return m.reply('❌ No se encontró el audio.')
        
        let v = search.videos[0].url
        let res = await fetch(`${endpoint}?url=${encodeURIComponent(v)}&api_key=${key}`)
        let json = await res.json()

        if (!json.status || !json.result) {
            await m.react('🚫')
            return m.reply('💀 *ERROR:* El rastro del audio se ha perdido.')
        }

        const audio = json.result

        let report = `| 🎵 *𝖴𝖢𝖧𝖨𝖧𝖠 𝖤𝖷𝖳𝖱𝖠𝖢𝖴𝖮́𝖭* 🎵\n`
        report += `|═══════════════════\n`
        report += `| 💿 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${audio.title}\n`
        report += `| 🎧 *𝙲𝙰𝙻𝙸𝙳𝙰𝙳:* 320kbps\n`
        report += `| 📡 *𝚂𝚃𝙰𝚃𝚄𝚂:* ✅ Sincronizado\n`
        report += `|═══════════════════\n`
        report += `| 🛠️ *${dev}*\n`
        report += `| ⛩️ *${net}*`

        await conn.reply(m.chat, report, m)

        await conn.sendMessage(m.chat, { 
            audio: { url: audio.dl_url }, 
            mimetype: 'audio/mpeg',
            fileName: `${audio.title}.mp3`
        }, { quoted: m })

        await m.react('🔥')

    } catch (e) {
        await m.react('✖️')
    }
}

handler.help = ['ytmp3']
handler.tags = ['descargas']
handler.command = ['ytmp3v2']

export default handler
