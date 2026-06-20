/**
 * 📂 COMANDO: Uchiha YouTube MP3 Downloader
 * 📝 DESCRIPCIÓN: Extrae y descarga el audio de YouTube con el mapeo del JSON de la API.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import fetch from "node-fetch"

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const apiKey = 'sasuke'
    if (!text) return conn.reply(m.chat, `*☁️ Uchiha Cloud Download*\n\n*Uso correcto:*\n> *${usedPrefix + command} https://youtu.be/XXXXXX*`, m)

    await m.react('⏳')
    try {
        let resDl = await fetch(`https://api.evogb.org/dl/ytmp3?url=${encodeURIComponent(text)}&key=${apiKey}`)
        let jsonDl = await resDl.json()
        
        if (!jsonDl.status || !jsonDl.data || !jsonDl.data.dl) {
            await m.react('❌')
            return m.reply('❌ Error al procesar la descarga del audio de YouTube.')
        }

        let { title, thumbnail, author, dl, quality } = jsonDl.data

        let txt = `*☁️ Uchiha Cloud - Audio Localizado*\n\n`
        txt += `📌 *Título:* ${title}\n`
        txt += `👤 *Canal:* ${author?.name || 'Desconocido'}\n`
        txt += `💿 *Calidad:* ${quality || '128kbps'}\n\n`
        txt += `📂 *COMANDO:* Uchiha Cloud Download Unified\n`
        txt += `👤 *CREADOR:* Barboza Developer\n`
        txt += `⚡ *CANAL:* Barboza Developer x Zona Developers\n`
        txt += `🔌 *API:* https://api.evogb.org`

        if (thumbnail) {
            await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: txt }, { quoted: m })
        } else {
            await conn.reply(m.chat, txt, m)
        }

        await conn.sendMessage(m.chat, { 
            audio: { url: dl }, 
            mimetype: 'audio/mpeg', 
            fileName: `${title}.mp3` 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('❌ Ocurrió un error interno en los servidores de Uchiha Cloud.')
    }
}

handler.help = ['ytmp3v2']
handler.tags = ['downloader']
handler.command = /^(ytmp3v2|yta|playmp3)$/i

export default handler
