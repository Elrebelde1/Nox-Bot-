/**
 * 📂 COMANDO: Multi-Descargador
 * 📝 DESCRIPCIÓN: Descarga de IG, FB y TikTok con comandos específicos.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *Ingresa un enlace para descargar*\n\n> *Ejemplo:* ${usedPrefix + command} https://...`, m)

    await m.react('⏳')

    try {
        const _0x4a1b = 'ZWt1c2Fz' 
        const key = Buffer.from(_0x4a1b, 'base64').toString('utf-8').split('').reverse().join('')
        let endpoint = ''
        let downloadUrl = ''
        let title = 'Video Descargado'

        // Lógica según el comando usado
        if (/^(ig|instagram)$/i.test(command)) {
            endpoint = `https://api.evogb.org/dl/instagram?url=${encodeURIComponent(query)}&key=${key}`
        } else if (/^(fb|facebook)$/i.test(command)) {
            endpoint = `https://api.evogb.org/dl/facebook?url=${encodeURIComponent(query)}&key=${key}`
        } else if (/^(tk|tiktok)$/i.test(command)) {
            endpoint = `https://api.evogb.org/dl/tiktok?url=${encodeURIComponent(query)}&key=${key}`
        }

        const { data } = await axios.get(endpoint)
        if (!data.status) {
            await m.react('❌')
            return m.reply('⚠️ *Error al procesar el enlace. Verifica que sea correcto.*')
        }

        // Extracción de datos por plataforma
        if (/ig|instagram/.test(command)) {
            downloadUrl = data.data[0].url
            title = 'Instagram Reel/Video'
        } else if (/fb|facebook/.test(command)) {
            downloadUrl = data.resultados[0].url
            title = 'Facebook Video'
        } else if (/tk|tiktok/.test(command)) {
            downloadUrl = data.data.dl
            title = data.data.title
        }

        let ui = `┏━━━━━━━━━━━━━━━━┓\n`
        ui += `┃   📥 *DESCARGADOR* ┃\n`
        ui += `┗━━━━━━━━━━━━━━━━┛\n\n`
        ui += `📝 *INFO:* ${title.slice(0, 100)}...\n\n`
        ui += `━━━━━━━━━━━━━━━━━━━━\n`
        ui += `⚡ *By: Barboza Developer*\n`
        ui += `🌐 *Zona Developers*`

        await conn.sendMessage(m.chat, { 
            video: { url: downloadUrl }, 
            caption: ui,
            mimetype: 'video/mp4'
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply('⚠️ *Ocurrió un error al conectar con la API.*')
    }
}

handler.help = ['ig', 'fb', 'tk']
handler.tags = ['downloader']
handler.command = /^(ig2|instagram2|fb2|facebook2|tk2|tiktok2)$/i

export default handler
