/**
 * 📂 COMANDO: xnxx
 * 📝 DESCRIPCIÓN: Busca y descarga contenido de XNXX de forma directa.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('🚀 Por seguridad, usa este comando en un grupo.')
    
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *¿Qué deseas buscar?*\n\n> *Ejemplo:* ${usedPrefix + command} Rusas`, m)

    await m.react('🔍')

    try {
        const searchRes = await axios.get(`https://api.delirius.store/search/xnxxsearch?query=${encodeURIComponent(query)}`)
        
        if (!searchRes.data.status || !searchRes.data.data.length) {
            await m.react('❌')
            return m.reply('⚠️ No se encontraron resultados.')
        }

        const videoInfo = searchRes.data.data[0]
        const downloadRes = await axios.get(`https://api.delirius.store/download/xnxxdl?url=${videoInfo.link}`)
        
        if (!downloadRes.data.status) {
            await m.react('❌')
            return m.reply('⚠️ El contenido no está disponible.')
        }

        const dl = downloadRes.data.data
        const videoFinal = dl.download.high || dl.download.low

        let caption = `🔞 *XNXX CONTENT — BARBOZA*\n\n`
        caption += `📌 *Título:* ${dl.title}\n`
        caption += `⏱️ *Duración:* ${dl.duration}\n`
        caption += `⚙️ *Calidad:* ${dl.quality}\n\n`
        caption += `> *By: Barboza Developer x Zona Developers*`

        await conn.sendMessage(m.chat, { 
            video: { url: videoFinal }, 
            caption: caption,
            mimetype: 'video/mp4',
            fileName: `video_barboza.mp4`
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply('⚠️ Error al procesar la solicitud.')
    }
}

handler.help = ['xnxx']
handler.tags = ['nsfw']
handler.command = /^(xnxx|xnxxdll)$/i

export default handler
