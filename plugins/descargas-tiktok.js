/**
 * 📂 COMANDO: TikTok Uchiha Downloader
 * 📝 DESCRIPCIÓN: Soporte total de enlaces (Cortos/Largos). Envía video + botones.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔗 API: https://sylphyy.xyz

import fetch from "node-fetch"

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
    const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
    const net = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"
    
    const decode = (s) => Buffer.from(s, 'base64').toString('utf-8')
    const api = decode("aHR0cHM6Ly9zeWxwaHl5Lnh5ei9kb3dubG9hZC90aWt0b2s=")
    const key = decode("c3lscGh5LTZmMTUwZA==")

    const type = args[0]
    const link = args[1]

    if (type && link) {
        await m.react('⏳')
        try {
            const res = await fetch(`${api}?url=${link}&api_key=${key}`)
            const json = await res.json()
            const data = json.result

            if (type === 'hd') {
                await conn.sendMessage(m.chat, { 
                    video: { url: data.hdplay || data.play }, 
                    caption: `🎬 *CALIDAD ULTRA HD*\n📌 ${data.title}\n\n${net}` 
                }, { quoted: m })
            } else if (type === 'audio') {
                await conn.sendMessage(m.chat, { 
                    audio: { url: data.music }, 
                    mimetype: 'audio/mpeg', 
                    fileName: `${data.title}.mp3` 
                }, { quoted: m })
            }
            return await m.react('🔥')
        } catch (e) {
            return m.react('✖️')
        }
    }

    if (!text) return conn.reply(m.chat, `⚔️ *SISTEMA UCHIHA*\n\n> 🔗 *Pega cualquier enlace de TikTok*\n> *(Soporta enlaces cortos y largos)*`, m)
    
    const tiktokRegex = /http(?:s?):\/\/(?:www\.|vt\.|vm\.)?tiktok\.com\/([^\s]+)/g
    const match = text.match(tiktokRegex)
    if (!match) return m.reply('🚫 Enlace de TikTok no detectado.')
    const cleanUrl = match[0]

    await m.react('🔍')

    try {
        const res = await fetch(`${api}?url=${encodeURIComponent(cleanUrl)}&api_key=${key}`)
        const json = await res.json()

        if (!json.status) return m.reply('🚫 El servidor no pudo procesar este enlace.')

        const data = json.result
        const caption = `| 🎵 *𝖴𝖢𝖧𝖨𝖧𝖠 𝖳𝖨𝖪𝖳𝖮𝖪* 🎵\n` +
                        `|═══════════════════\n` +
                        `| 👤 *𝙰𝚄𝚃𝙾𝚁:* ${data.author.nickname}\n` +
                        `| 📝 *𝙳𝙴𝚂𝙲:* ${data.title}\n` +
                        `| ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾́𝙽:* ${data.duration}s\n` +
                        `|═══════════════════\n` +
                        `| 🛠️ *${dev}*\n` +
                        `| ⛩️ *${net}*`

        const buttons = [
            { buttonId: `${usedPrefix + command} hd ${cleanUrl}`, buttonText: { displayText: "🎬 Descargar en HD" }, type: 1 },
            { buttonId: `${usedPrefix + command} audio ${cleanUrl}`, buttonText: { displayText: "🎧 Extraer Audio" }, type: 1 }
        ]

        await conn.sendMessage(m.chat, {
            video: { url: data.play },
            caption: caption,
            buttons: buttons,
            viewOnce: true
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('✖️')
    }
}

handler.help = ['tiktok']
handler.tags = ['descargas']
handler.command = ['tiktok', 'tt']

export default handler