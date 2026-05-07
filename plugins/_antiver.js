/**
 * 📂 COMANDO: Uchiha Translator Pro
 * 📝 DESCRIPCIÓN: Traducción rápida con soporte para Reply.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "Barboza Developer"
    const chn = "Zona Developers"

    // Si no hay texto y no está respondiendo a un mensaje, pide el texto
    let q = m.quoted ? m.quoted.text : text
    if (!q) return conn.reply(m.chat, `*𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n${usedPrefix + command} [código] [texto]\n\n*𝙴𝚓𝚎𝚖𝚙𝚕𝚘:* \n${usedPrefix + command} en Hola\n\n*𝙾 𝚛𝚎𝚜𝚙𝚘𝚗𝚍𝚎 𝚊 𝚞𝚗 𝚖𝚎𝚗𝚜𝚊𝚓𝚎 𝚌𝚘𝚗:* ${usedPrefix + command}`, m)

    if (m.react) await m.react('🌎')

    try {
        let lang = 'es' // Idioma por defecto
        let input = q

        // Detectar si el usuario especificó un idioma (ej: .trad en hello)
        if (text && text.split(' ')[0].length === 2) {
            lang = text.split(' ')[0]
            input = m.quoted ? m.quoted.text : text.split(' ').slice(1).join(' ')
        }

        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${encodeURIComponent(input)}`)
        const json = await res.json()

        if (!json || !json[0]) throw 'Error en la respuesta'

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
        console.error(e)
        if (m.react) await m.react('❌')
        conn.reply(m.chat, '🛑 El servidor de traducción está saturado. Intenta de nuevo.', m)
    }
}

handler.help = ['traducir']
handler.tags = ['tools']
handler.command = /^(translate|traducir|trad)$/i

export default handler
