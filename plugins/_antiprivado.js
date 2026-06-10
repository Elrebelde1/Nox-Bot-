/**
 * 📂 COMANDO: Uchiha Google Image
 * 📝 DESCRIPCIÓN: Buscador de imágenes de Google con visualización aleatoria.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "𝘽𝙮 𝘽𝙖𝙧𝙗𝙤𝙯𝙖"
    const chn = "𝙕𝙤𝙣𝙖 𝘿𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙧𝙨"

    if (!text) return conn.reply(m.chat, `*🔍 ¿Qué imágenes deseas buscar?*\n*Ejemplo:* ${usedPrefix + command} Messi`, m)

    if (m.react) await m.react('🔍')

    try {
        let res = await fetch(`https://api.evogb.org/search/googleimage?query=${encodeURIComponent(text)}&key=sasuke`)
        let json = await res.json()

        if (!json.status || !json.result || json.result.length === 0) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '🛑 No encontré imágenes.', m)
        }

        let results = json.result.sort(() => 0.5 - Math.random()).slice(0, 5)

        let album = []
        for (let data of results) {
            album.push({
                image: { url: data.image },
                caption: `「 🖼️ 𝚄𝙲𝙷𝙸𝙷𝙰 𝙸𝙼𝙰𝙶𝙴𝚂 」\n` +
                         `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n` +
                         `│ 📌 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${data.title}\n` +
                         `│ 🔍 *𝙱𝚄𝚂𝚀𝚄𝙴𝙳𝙰:* ${text.toUpperCase()}\n` +
                         `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n` +
                         `⚡ *Code creado por ${dev}*\n` +
                         `📡 *Disfruta el código de ${dev} x ${chn}*`
            })
        }

        await conn.sendAlbum(m.chat, album, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (error) {
        if (m.react) await m.react('❌')
        conn.reply(m.chat, '⚠️ Error en el servidor.', m)
    }
}

handler.help = ['imagen <texto>']
handler.tags = ['internet']
handler.command = /^(googleimage2|img2|imagen|foto)$/i

export default handler
