/**
 * 📂 COMANDO: Uchiha Sticker Pro
 * 📝 DESCRIPCIÓN: Busca en Sticker.ly y descarga los primeros 6 stickers.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const apiKey = 'sasuke'

    if (!text.trim()) {
        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚂𝚃𝙸𝙲𝙺𝙴𝚁𝚂* ♆ 〕─╮\n│\n│ 🔍 *𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n│ ${usedPrefix + command} [nombre]\n│\n│ 🌑 "ɪɴᴠᴏᴄᴀɴᴅᴏ sᴛɪᴄᴋᴇʀs ᴅᴇʟ ᴘᴀǫᴜᴇᴛᴇ"\n╰────────────────────────────╯`
        return conn.reply(m.chat, txt, m)
    }

    if (m.react) await m.react('⏳')

    try {
        // 1. BUSCADOR USANDO API GATA
        let searchRes = await fetch(`https://api.evogb.org/stickerly/search?query=${encodeURIComponent(text)}&key=${apiKey}`)
        let searchJson = await searchRes.json()

        if (!searchJson.status || !searchJson.resultados.length) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ No encontré ningún paquete con ese nombre.', m)
        }

        // Seleccionamos el primer paquete encontrado
        let pick = searchJson.resultados[0]

        // 2. DESCARGA USANDO API DELIRIUS
        const downloadRes = await fetch(`https://api.delirius.store/download/stickerly?url=${encodeURIComponent(pick.url)}`)
        const downloadJson = await downloadRes.json()

        if (!downloadJson.status || !downloadJson.data.stickers) {
            throw 'Error en la descarga'
        }

        let stickers = downloadJson.data.stickers
        let limit = stickers.slice(0, 6) // Limitamos a 6 stickers

        await conn.reply(m.chat, `📦 *Paquete:* ${pick.name}\n✨ *Enviando 6 stickers...*\n\n⚡ *By: Barboza Developer*`, m)

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

handler.help = ['stickerly']
handler.tags = ['sticker']
handler.command = /^(stickerly2|sget|sticker2)$/i

export default handler
