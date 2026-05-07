/**
 * 📂 COMANDO: Uchiha Translator
 * 📝 DESCRIPCIÓN: Traduce textos a cualquier idioma.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Protección de identidad
    const dev = "Barboza Developer"
    const chn = "Zona Developers"

    if (!text) {
        return conn.reply(m.chat, `*𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n${usedPrefix + command} [código de idioma] [texto]\n\n*𝙴𝚓𝚎𝚖𝚙𝚕𝚘:* \n${usedPrefix + command} en Hola mundo\n\n*(Si no pones código, traducirá al español)*`, m)
    }

    if (m.react) await m.react('🌎')

    try {
        // Separamos el idioma del texto (si se proporciona)
        let lang = 'es'
        let msg = text
        const args = text.split(' ')
        
        if (args.length > 1 && args[0].length === 2) {
            lang = args[0]
            msg = args.slice(1).join(' ')
        }

        const res = await fetch(`https://api.linguatools.org/translate?text=${encodeURIComponent(msg)}&lang=${lang}`)
        // Nota: Si usas una API de Google Translate gratuita, la URL sería diferente. 
        // Usaremos esta alternativa rápida de MyMemory para mayor estabilidad:
        const translateUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(msg)}&langpair=autodetect|${lang}`
        
        const response = await fetch(translateUrl)
        const json = await response.json()

        if (!json.responseData) {
            throw 'Error en la traducción'
        }

        const result = json.responseData.translatedText
        
        let info = `「 🌎 𝚄𝙲𝙷𝙸𝙷𝙰 𝚃𝚁𝙰𝙽𝚂𝙻𝙰𝚃𝙴 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 📝 *𝙾𝚁𝙸𝙶𝙸𝙽𝙰𝙻:* ${msg}\n`
        info += `│ 🔄 *𝚃𝚁𝙰𝙳𝚄𝙲𝙲𝙸𝙾𝙽:* ${result}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `⚡ *By: ${dev}*\n`
        info += `📡 *Canal:* ${chn}`

        // Validación de créditos (opcional)
        if (!info.includes(dev)) return

        await conn.reply(m.chat, info, m)
        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        conn.reply(m.chat, '🛑 Ocurrió un error al traducir.', m)
    }
}

handler.help = ['translate']
handler.tags = ['tools']
handler.command = /^(translate2|traducir|trad)$/i

export default handler
