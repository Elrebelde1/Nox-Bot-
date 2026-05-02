/**
 * 📂 COMANDO: mediafire
 * 📝 DESCRIPCIÓN: Descarga archivos de MediaFire.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *Ingresa un enlace de MediaFire*\n\n> *Ejemplo:* ${usedPrefix + command} https://www.mediafire.com/file/...`, m)

    await m.react('📥')

    try {
        const _0x4a1b = 'ZWt1c2Fz' 
        const key = Buffer.from(_0x4a1b, 'base64').toString('utf-8').split('').reverse().join('')

        const { data } = await axios.get(`https://api.evogb.org/dl/mediafire?url=${encodeURIComponent(query)}&key=${key}`)

        if (!data.status) {
            await m.react('❌')
            return m.reply('⚠️ *No se pudo obtener el archivo.*')
        }

        let ui = `┏━━━━━━━━━━━━━━━━┓\n`
        ui += `┃  📦 *MEDIAFIRE DL* ┃\n`
        ui += `┗━━━━━━━━━━━━━━━━┛\n\n`
        ui += `📄 *NOMBRE:* ${data.data.name}\n`
        ui += `⚖️ *PESO:* ${data.data.size}\n`
        ui += `📁 *TIPO:* ${data.data.type}\n\n`
        ui += `━━━━━━━━━━━━━━━━━━━━\n`
        ui += `⚡ *By: Barboza Developer*\n`
        ui += `🌐 *Zona Developers*`

        await conn.sendMessage(m.chat, { 
            document: { url: data.data.dl }, 
            fileName: data.data.name, 
            mimetype: data.data.type.includes('APK') ? 'application/vnd.android.package-archive' : 'application/octet-stream',
            caption: ui
        }, { quoted: m })
        
        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply('⚠️ *Error al conectar con MediaFire.*')
    }
}

handler.help = ['mediafire']
handler.tags = ['downloader']
handler.command = /^(mediafire2|mf2)$/i

export default handler
