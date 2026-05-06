/**
 * 📂 COMANDO: Uchiha Sticker DL
 * 📝 DESCRIPCIÓN: Busca y descarga paquetes de stickers automáticamente.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const apiKey = 'sasuke'

    if (!text.trim()) {
        let txt = `╭─〔 ♆ *𝚂𝚃𝙸𝙲𝙺𝙴𝚁 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳* ♆ 〕─╮\n│\n│ 🔍 *𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n│ ${usedPrefix + command} [nombre]\n│\n│ 🌑 "ɪɴᴠᴏᴄᴀɴᴅᴏ sᴛɪᴄᴋᴇʀs ᴅᴇʟ ᴘᴀǫᴜᴇᴛᴇ"\n╰────────────────────────────╯`
        return conn.reply(m.chat, txt, m)
    }

    if (m.react) await m.react('⏳')

    try {
        // 1. Buscamos el paquete
        let resSearch = await fetch(`https://api.evogb.org/stickerly/search?query=${encodeURIComponent(text)}&key=${apiKey}`)
        let jsonSearch = await resSearch.json()

        if (!jsonSearch.status || !jsonSearch.resultados.length) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ No encontré ningún paquete con ese nombre.', m)
        }

        // Tomamos el primer resultado (el más relevante)
        let packId = jsonSearch.resultados[0].url.split('/').pop()
        
        // 2. Obtenemos los stickers del paquete
        let resPack = await fetch(`https://api.evogb.org/stickerly/pack?id=${packId}&key=${apiKey}`)
        let jsonPack = await resPack.json()

        if (!jsonPack.status || !jsonPack.resultados.stickers) {
            throw 'Error al obtener stickers'
        }

        let stickers = jsonPack.resultados.stickers
        // Limitamos a 6 stickers para no saturar/banear el bot
        let limit = stickers.slice(0, 6)

        await conn.reply(m.chat, `📦 *Paquete:* ${jsonSearch.resultados[0].name}\n✨ *Enviando 6 stickers...*\n\n⚡ *By: Barboza Developer*`, m)

        for (let stickerUrl of limit) {
            await conn.sendMessage(m.chat, { sticker: { url: stickerUrl } }, { quoted: m })
        }

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        conn.reply(m.chat, '🛑 Ocurrió un error al procesar los stickers.', m)
    }
}

handler.help = ['sget']
handler.tags = ['sticker']
handler.command = /^(sget|stickerlydl|stickers2)$/i

export default handler
