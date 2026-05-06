/**
 * 📂 COMANDO: Uchiha Sticker Search
 * 📝 DESCRIPCIÓN: Buscador de paquetes de stickers (Sticker.ly).
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const apiKey = 'sasuke'

    if (!text.trim()) {
        let txt = `╭─〔 ♆ *𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝚂𝙴𝙰𝚁𝙲𝙷* ♆ 〕─╮\n│\n│ 🔍 *𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n│ ${usedPrefix + command} [nombre del paquete]\n│\n│ 🌑 "ᴇʟ ᴘᴏᴅᴇʀ ᴅᴇʟ sʜᴀʀɪɴɢᴀɴ ᴇɴ sᴛɪᴄᴋᴇʀs"\n╰────────────────────────────╯`
        return conn.reply(m.chat, txt, m)
    }

    if (m.react) await m.react('🔍')

    try {
        let res = await fetch(`https://api.evogb.org/stickerly/search?query=${encodeURIComponent(text)}&key=${apiKey}`)
        let json = await res.json()

        if (!json.status || !json.resultados || json.resultados.length === 0) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ No se encontraron paquetes de stickers.', m)
        }

        // Tomamos los primeros 10 resultados para no saturar el chat
        let packs = json.resultados.slice(0, 10)
        let listado = `「 🎬 𝚄𝙲𝙷𝙸𝙷𝙰 𝚂𝚃𝙸𝙲𝙺𝙴𝚁𝚂 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`

        packs.forEach((pack, index) => {
            listado += `*${index + 1}.* ${pack.name}\n`
            listado += `│ 👤 *Autor:* ${pack.author}\n`
            listado += `│ 📦 *Stickers:* ${pack.stickerCount}\n`
            listado += `│ 🔗 *Link:* ${pack.url}\n`
            listado += `╰───────────────\n\n`
        })

        listado += `⚡ *By: Barboza Developer*`

        // Enviamos el primer resultado como imagen principal y el resto en el texto
        await conn.sendMessage(m.chat, { 
            image: { url: packs[0].thumbnailUrl }, 
            caption: listado,
            footer: "By Barboza-Team ⚡"
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        conn.reply(m.chat, '🛑 Error al conectar con la API.', m)
    }
}

handler.help = ['stickerly', 'stisearch']
handler.tags = ['search']
handler.command = /^(stickerly2|stickers2|ssearch)$/i

export default handler
