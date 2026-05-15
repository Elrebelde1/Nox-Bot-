/**
 * 📂 COMANDO: TikTok Uchiha Downloader
 * 📝 DESCRIPCIÓN: Descarga videos o audio de TikTok con botones.
 * 👤 CREADOR: Barboza Developer
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, args, usedPrefix, command }) => {
    const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
    const net = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"
    
    // Ofuscación de credenciales
    const decode = (s) => Buffer.from(s, 'base64').toString('utf-8')
    const api = decode("aHR0cHM6Ly9zeWxwaHl5Lnh5ei9kb3dubG9hZC90aWt0b2s=")
    const key = decode("c3lscGh5LTZmMTUwZA==")

    // Si el usuario presiona un botón, el comando se vuelve a ejecutar con argumentos
    const type = args[0] // 'hd' o 'audio'
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
                    caption: `✅ *Video HD Cargado*\n📌 ${data.title}\n\n${net}` 
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
            return m.reply('✖️ Error al procesar la descarga.')
        }
    }

    // Flujo inicial: Búsqueda y muestra de botones
    if (!text) return conn.reply(m.chat, `⚔️ *SISTEMA UCHIHA*\n\n> 🔗 *Pega un enlace de TikTok*`, m)
    
    await m.react('🔍')

    try {
        const res = await fetch(`${api}?url=${encodeURIComponent(text)}&api_key=${key}`)
        const json = await res.json()

        if (!json.status) return m.reply('🚫 Enlace inválido o servidor caído.')

        const data = json.result
        const caption = `| 🎵 *𝖴𝖢𝖧𝖨𝖧𝖠 𝖳𝖨𝖪𝖳𝖮𝖪* 🎵\n` +
                        `|═══════════════════\n` +
                        `| 👤 *𝙰𝚄𝚃𝙾𝚁:* ${data.author.nickname}\n` +
                        `| 📝 *𝙳𝙴𝚂𝙲:* ${data.title}\n` +
                        `| ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾́𝙽:* ${data.duration}s\n` +
                        `|═══════════════════\n` +
                        `| 🛠️ *${dev}*\n` +
                        `| ⛩️ *${net}*`

        // Adaptación de botones según tu ejemplo
        const buttons = [
            { buttonId: `${usedPrefix + command} hd ${text}`, buttonText: { displayText: "🎬 Ver Video HD" }, type: 1 },
            { buttonId: `${usedPrefix + command} audio ${text}`, buttonText: { displayText: "🎧 Extraer Audio" }, type: 1 }
        ]

        await conn.sendMessage(m.chat, {
            image: { url: data.cover },
            caption: caption,
            buttons: buttons,
            viewOnce: true
        }, { quoted: m })

    } catch (e) {
        await m.react('✖️')
    }
}

handler.help = ['tiktok']
handler.tags = ['descargas']
handler.command = ['tiktok', 'tt']

export default handler
