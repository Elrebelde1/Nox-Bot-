/**
 * 📂 COMANDO: Uchiha AI Image Single
 * 📝 DESCRIPCIÓN: Generador de una imagen con IA con diseño ninja.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔗 API: https://api.evogb.org/ai/nanobanana
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "𝘽𝙮 𝘽𝙖𝙧𝙗𝙤𝙯𝙖"
    const chn = "𝙕𝙤𝙣𝙖 𝘿𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙧𝙨"
    
    const _0x5c4a = ["\x73\x61\x73\x75\x6b\x65"] 
    const key = _0x5c4a[0]

    if (!text) return conn.reply(m.chat, `*🏮 [ SISTEMA UCHIHA ]*\n\n*Ingresa el concepto para generar la imagen.*\n*Ejemplo:* ${usedPrefix + command} Itachi Uchiha realismo`, m)

    if (m.react) await m.react('🧬')

    try {
        let res = await fetch(`https://api.evogb.org/ai/nanobanana?prompt=${encodeURIComponent(text)}&key=${key}`)
        
        if (!res.ok) throw new Error()

        let imageUrl
        const contentType = res.headers.get('content-type')

        if (contentType && contentType.includes('application/json')) {
            let json = await res.json()
            if (!json.status || !json.result) {
                if (m.react) await m.react('❌')
                return conn.reply(m.chat, '🛑 *Error:* No se pudo generar la imagen.', m)
            }
            imageUrl = json.result
        } else {
            imageUrl = res.url 
        }

        let txt = `┏━━━━━━━━━━━━━━━━━━┓\n`
        txt += `┃   🏮  *UCHIHA AI VISION* 🏮\n`
        txt += `┣━━━━━━━━━━━━━━━━━━┛\n`
        txt += `┃\n`
        txt += `┃ 📝 *Pʀᴏᴍᴘᴛ:* \n`
        txt += `┃ » _${text}_ \n`
        txt += `┃\n`
        txt += `┃ ⚙️ *Esᴛᴀᴅᴏ:* 🟢 Finalizado\n`
        txt += `┃ 🧫 *Núᴄʟᴇᴏ:* Nanobanana API\n`
        txt += `┃\n`
        txt += `┣━━━━━━━━━━━━━━━━━━┓\n`
        txt += `┃ ⚡ *${dev}*\n`
        txt += `┃ 📡 *${chn}*\n`
        txt += `┗━━━━━━━━━━━━━━━━━━┛`

        await conn.sendMessage(m.chat, { 
            image: { url: imageUrl }, 
            caption: txt 
        }, { quoted: m })

        if (m.react) await m.react('✨')

    } catch (error) {
        if (m.react) await m.react('❌')
        console.error(error)
        conn.reply(m.chat, '🛑 *Error en la Matrix:* Falló la conexión con la IA.', m)
    }
}

handler.help = ['airender <texto>']
handler.tags = ['ai']
handler.command = /^(airender|iaimg|gen)$/i

export default handler
