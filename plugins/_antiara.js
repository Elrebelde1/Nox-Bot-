/**
 * 📂 COMANDO: Uchiha AI Image Burst
 * 📝 DESCRIPCIÓN: Generador de 6 imágenes con IA en ráfaga.
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

    if (!text) return conn.reply(m.chat, `*🏮 [ SISTEMA UCHIHA ]*\n\n*Ingresa el concepto para generar 6 variantes.*\n*Ejemplo:* ${usedPrefix + command} Itachi Uchiha realismo`, m)

    if (m.react) await m.react('🧬')

    try {
        let count = 6
        for (let i = 0; i < count; i++) {
            let res = await fetch(`https://api.evogb.org/ai/nanobanana?prompt=${encodeURIComponent(text + ' ' + Math.random())}&key=${key}`)
            
            let imageUrl
            const contentType = res.headers.get('content-type')

            if (contentType && contentType.includes('application/json')) {
                let json = await res.json()
                imageUrl = json.result
            } else {
                imageUrl = res.url 
            }

            let txt = `┏━━━━━━━━━━━━━━━━━━┓\n`
            txt += `┃   🏮  *UCHIHA AI BURST* 🏮\n`
            txt += `┣━━━━━━━━━━━━━━━━━━┛\n`
            txt += `┃\n`
            txt += `┃ 📝 *Pʀᴏᴍᴘᴛ:* ${text}\n`
            txt += `┃ 🖼️ *Vᴀʀɪᴀɴᴛᴇ:* ${i + 1} / ${count}\n`
            txt += `┃ ⚙️ *Esᴛᴀᴅᴏ:* 🟢 Inyectado\n`
            txt += `┃\n`
            txt += `┣━━━━━━━━━━━━━━━━━━┓\n`
            txt += `┃ ⚡ *${dev}*\n`
            txt += `┃ 📡 *${chn}*\n`
            txt += `┗━━━━━━━━━━━━━━━━━━┛`

            await conn.sendMessage(m.chat, { 
                image: { url: imageUrl }, 
                caption: txt 
            }, { quoted: m })
        }

        if (m.react) await m.react('✨')

    } catch (error) {
        if (m.react) await m.react('❌')
        conn.reply(m.chat, '🛑 *Fallo de Red:* No se pudo completar la ráfaga de imágenes.', m)
    }
}

handler.help = ['airender <texto>']
handler.tags = ['ai']
handler.command = /^(airender|iaimg6|gen6)$/i

export default handler
