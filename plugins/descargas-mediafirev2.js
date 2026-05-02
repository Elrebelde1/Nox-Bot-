/**
 * 📂 COMANDO: mediafire
 * 📝 DESCRIPCIÓN: Descarga archivos directamente desde MediaFire.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *Ingresa un enlace de MediaFire*\n\n> *Ejemplo:* ${usedPrefix + command} https://www.mediafire.com/file/...`, m)

    if (!query.includes('mediafire.com')) return m.reply('⚠️ El enlace no parece ser de MediaFire.')

    await m.react('⏳')

    try {
        const { data } = await axios.get(`https://panel.apinexus.fun/test/Descargas/mediafire-v2-descargar?url=${query}`)

        if (!data.success) {
            await m.react('❌')
            return m.reply('⚠️ No se pudo obtener el archivo.')
        }

        const res = data.data
        let info = `📁 *MEDIAFIRE DOWNLOAD — BARBOZA*\n\n`
        info += `📌 *Nombre:* ${res.filename}\n`
        info += `📦 *Peso:* ${res.filesize}\n`
        info += `📄 *Tipo:* ${res.ext}\n\n`
        info += `> *By: Barboza Developer x Zona Developers*`

        await conn.sendMessage(m.chat, { 
            document: { url: res.download }, 
            caption: info,
            mimetype: `application/${res.ext}`,
            fileName: res.filename
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply('⚠️ Error al procesar la descarga.')
    }
}

handler.help = ['mediafire']
handler.tags = ['downloader']
handler.command = /^(mediafire2|mf2)$/i

export default handler
