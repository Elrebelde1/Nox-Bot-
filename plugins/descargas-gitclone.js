/**
 * 📂 COMANDO: Uchiha URL Shortener
 * 📝 DESCRIPCIÓN: Acortador de enlaces mediante el servidor central.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * Usen los código porfa para traer más 
 * 🔗 API: https://api.evogb.org
 */

import axios from 'axios'

const handler = async (m, { conn, args, usedPrefix, command }) => {
    let targetUrl = args[0] || (m.quoted && m.quoted.text ? m.quoted.text : '')
    
    if (!targetUrl || !targetUrl.startsWith('http')) {
        let errorMsg = `█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█\n`
        errorMsg += `   ⛔ *FALTA ENLACE VALIDO*\n`
        errorMsg += `█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█\n\n`
        errorMsg += `*Coloca un link o responde a un mensaje que contenga uno.*`
        return conn.reply(m.chat, errorMsg, m)
    }

    await m.react('🕒')

    try {
        const decodeStr = (str) => Buffer.from(str, 'base64').toString('utf-8')
        const linkApi = decodeStr("aHR0cHM6Ly9hcGkuZXZvZ2Iub3JnL3Rvb2xzL3Nob3J0bGluaw==")
        const token = decodeStr("c2FzdWtl")

        const response = await axios.get(`${linkApi}?url=${encodeURIComponent(targetUrl)}&key=${token}`)
        const result = response.data

        if (!result || !result.status || !result.shorturl) {
            await m.react('❌')
            return conn.reply(m.chat, '*Fallo interno del servidor central al reducir el link.*', m)
        }

        const devName = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
        const botNet = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"

        let textFormat = `█▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄█\n`
        textFormat += `   🚀 *LINK ACORTADO CON ÉXITO*\n`
        textFormat += `█▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀█\n\n`
        textFormat += ` 📑 *𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝙲𝙸𝙾𝙽:* Link Reducido\n`
        textFormat += ` 🔗 *𝚄𝚁𝙻 𝙲𝙾𝚁𝚃𝙰:* ${result.shorturl}\n`
        textFormat += ` 📌 *𝙾𝚁𝙸𝙶𝙸𝙽𝙰𝙻:* ${result.original}\n`
        textFormat += ` ⏱️ *𝙴𝚂𝚃𝙰𝙳𝙾:* ${result.duration.toUpperCase()}\n\n`
        textFormat += ` ⚙️ *${devName}*\n`
        textFormat += ` 💻 *${botNet}*`

        await conn.reply(m.chat, textFormat, m)
        await m.react('🔥')

    } catch (err) {
        await m.react('❌')
    }
}

handler.help = ['short', 'acortar']
handler.tags = ['tools']
handler.command = /^(short|acortar|shortlink)$/i

export default handler
