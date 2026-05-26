/**
 * 📂 COMANDO: Uchiha YouTube Downloader (Play3 & Play4)
 * 📝 DESCRIPCIÓN: Extractor de audio y video con Axios y Buffer por enlace directo.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * Usen los código porfa para traer más 
 * 🔗 API: https://api.evogb.org
 */

import axios from 'axios'

async function getBuffer(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    return Buffer.from(response.data)
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
    if (!args[0]) return conn.reply(m.chat, `⚔️ *SISTEMA UCHIHA*\n\n> 🔗 *Ingresa un enlace válido de YouTube.*\n> 📝 *Ej:* ${usedPrefix + command} https://www.youtube.com/watch?v=5M_n2UCe7DQ`, m)

    await m.react('🕒')

    try {
        let videoUrl = args[0]
        const type = command.toLowerCase() === 'play4' ? 'ytmp4' : 'ytmp3'
        
        const b = (s) => Buffer.from(s, 'base64').toString('utf-8')
        const endpoint = b("aHR0cHM6Ly9hcGkuZXZvZ2Iub3JnL2RsLw==")
        const access = b("YWJjZDEyMzQ=")

        let queryUrl = `${endpoint}${type}?url=${encodeURIComponent(videoUrl)}`
        if (type === 'ytmp4') {
            queryUrl += `&quality=auto&key=${access}`
        } else {
            queryUrl += `&key=${access}`
        }

        const { data: res } = await axios.get(queryUrl)

        if (!res || !res.data || !res.data.dl) {
            await m.react('❌')
            return m.reply('*Error al obtener el enlace de descarga del servidor.*')
        }

        const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
        const net = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"

        let report = `| ⛩️ *𝖴𝖢𝖧𝖨𝖧𝖠 𝖯𝖫𝖠𝖸𝖤𝖱* ⛩️\n`
        report += `|═══════════════════\n`
        report += `| 🟢 *𝚂𝚃𝙰𝚃𝚄𝚂:* Archivo Procesado\n`
        report += `| 📦 *𝙵𝙾𝚁𝙼𝙰𝚃𝙾:* ${type === 'ytmp4' ? 'MP4 (VIDEO)' : 'MP3 (AUDIO)'}\n`
        report += `|═══════════════════\n`
        report += `| 🛠️ *${dev}*\n`
        report += `| ⛩️ *${net}*`

        await conn.reply(m.chat, report, m)

        const fileBuffer = await getBuffer(res.data.dl)

        if (type === 'ytmp3') {
            await conn.sendMessage(m.chat, { 
                audio: fileBuffer, 
                mimetype: 'audio/mpeg',
                ptt: false
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                video: fileBuffer, 
                mimetype: 'video/mp4'
            }, { quoted: m })
        }

        await m.react('🔥')

    } catch (e) {
        await m.react('❌')
    }
}

handler.help = ['ytmp3v2', 'ytmp4v3']
handler.tags = ['downloader']
handler.command = /['ytmp3v2','ytmp4v3']

export default handler
