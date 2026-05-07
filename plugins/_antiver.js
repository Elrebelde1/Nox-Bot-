/**
 * 📂 COMANDO: Uchiha Translator Pro
 * 📝 DESCRIPCIÓN: Traduce mensajes de cualquier idioma al español automáticamente.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 👑 API BY: Google Engine
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "Barboza Developer"
    const chn = "Zona Developers"

    let q = m.quoted ? m.quoted.text : text
    if (!q) return conn.reply(m.chat, `*𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \nResponde a un mensaje en cualquier idioma con el comando *${usedPrefix + command}* para pasarlo a español automáticamente.`, m)

    if (m.react) await m.react('🌎')

    try {
        let lang = 'es'
        let input = q

        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(input)}`)
        const json = await res.json()

        if (!json || !json[0]) throw 'Error'

        const result = json[0].map(part => part[0]).join('')
        
        let info = `「 🌎 𝚄𝙲𝙷𝙸𝙷𝙰 𝚃𝚁𝙰𝙽𝚂𝙻𝙰𝚃𝙴 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 📝 *𝙾𝚁𝙸𝙶𝙸𝙽𝙰𝙻:* ${input}\n`
        info += `│ 🔄 *𝚃𝚁𝙰𝙳𝚄𝙲𝙲𝙸𝙾𝙽:* ${result}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `⚡ *By: ${dev}*\n`
        info += `📡 *Canal:* ${chn}`

        await conn.reply(m.chat, info, m)
        if (m.react) await m.react('✅')

    } catch (e) {
        if (m.react) await m.react('❌')
        conn.reply(m.chat, '🛑 El servidor de traducción está saturado.', m)
    }
}

handler.help = ['traducir']
handler.tags = ['tools']
handler.command = /^(translate|traducir|trad)$/i

export default handler
