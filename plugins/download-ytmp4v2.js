/**
 * 📂 COMANDO: ytmp4
 * 📝 DESCRIPCIÓN: Descarga videos de YouTube en formato MP4.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *¿Qué video de YouTube deseas descargar?*\n\n> *Ejemplo:* ${usedPrefix + command} https://www.youtube.com/watch?v=5M_n2UCe7DQ`, m)

    if (!query.includes('youtu')) return m.reply('⚠️ Por favor, ingresa un enlace válido de YouTube.')

    await m.react('⏳')

    try {
        const { data } = await axios.get(`https://api.delirius.store/download/ytmp4?url=${query}`)

        if (!data.status) {
            await m.react('❌')
            return m.reply('⚠️ No se pudo procesar la descarga.')
        }

        const vid = data.data
        const linkDescarga = vid.download

        let info = `🎥 *YOUTUBE MP4 — BARBOZA*\n\n`
        info += `📌 *Título:* ${vid.title}\n`
        info += `👤 *Canal:* ${vid.author}\n`
        info += `⚙️ *Calidad:* ${vid.format}\n\n`
        info += `> *By: Barboza Developer x Zona Developers*`

        await conn.sendMessage(m.chat, { 
            video: { url: linkDescarga }, 
            caption: info,
            mimetype: 'video/mp4',
            fileName: `${vid.title}.mp4`
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply('⚠️ Error al obtener el video.')
    }
}

handler.help = ['ytmp4']
handler.tags = ['downloader']
handler.command = /^(ytmp4v2)$/i

export default handler 