/**
 * 📂 COMANDO: Downloader Pro (Multi API)
 * 📝 DESCRIPCIÓN: Descarga de IG, FB, TikTok, Twitter y Terabox.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) {
        let alert = `✨ PLATFORM DOWNLOADER ✨\n`
        alert += `✧ ────────────────── ✧\n`
        alert += `> *Ingresa un enlace válido para procesar tu descarga.*\n`
        alert += `> *Uso:* ${usedPrefix + command} https://...`
        return conn.reply(m.chat, alert, m)
    }

    await m.react('⏳')

    try {
        const _0x4a1b = 'ZWt1c2Fz' 
        const key = Buffer.from(_0x4a1b, 'base64').toString('utf-8').split('').reverse().join('')
        let endpoint = ''

        if (/ig|instagram/i.test(command)) {
            endpoint = `https://api.evogb.org/dl/instagram?url=${encodeURIComponent(query)}&key=${key}`
        } else if (/fb|facebook/i.test(command)) {
            endpoint = `https://api.evogb.org/dl/facebook?url=${encodeURIComponent(query)}&key=${key}`
        } else if (/tk|tiktok/i.test(command)) {
            endpoint = `https://api.evogb.org/dl/tiktok?url=${encodeURIComponent(query)}&key=${key}`
        } else if (/tw|twitter/i.test(command)) {
            endpoint = `https://api.evogb.org/dl/twitter?url=${encodeURIComponent(query)}&key=${key}`
        } else if (/tera|terabox/i.test(command)) {
            endpoint = `https://api.evogb.org/dl/terabox?url=${encodeURIComponent(query)}&key=${key}`
        }

        const { data } = await axios.get(endpoint)
        
        if (!data.status) {
            await m.react('❌')
            return m.reply('❌ La API no devolvió una respuesta válida para este enlace.')
        }

        let downloadUrl = ''
        let isDocument = false
        let fileName = 'file'

        if (/ig|instagram/i.test(command)) {
            downloadUrl = data.data[0].url
        } else if (/fb|facebook/i.test(command)) {
            downloadUrl = data.resultados[0].url
        } else if (/tk|tiktok/i.test(command)) {
            downloadUrl = data.data.dl
        } else if (/tw|twitter/i.test(command)) {
            downloadUrl = data.data.result[0].url
        } else if (/tera|terabox/i.test(command)) {
            const fileData = data.data[0]
            downloadUrl = fileData.dlink || fileData.url
            fileName = fileData.server_filename || 'file.apk'
            if (fileName.endsWith('.apk') || fileData.path.includes('.apk')) {
                isDocument = true
            }
        }

        if (!downloadUrl) {
            await m.react('❌')
            return m.reply('❌ No se localizó el enlace directo de descarga en el servidor.')
        }

        if (isDocument) {
            await conn.sendMessage(m.chat, { 
                document: { url: downloadUrl }, 
                mimetype: 'application/vnd.android.package-archive',
                fileName: fileName
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                video: { url: downloadUrl }, 
                mimetype: 'video/mp4'
            }, { quoted: m })
        }

        await m.react('🔥')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('❌ Fallo de conexión en la infraestructura de la API.')
    }
}

handler.help = ['ig', 'fb', 'tk', 'tw', 'terabox']
handler.tags = ['downloader']
handler.command = ['ig3', 'fb3', 'tk3', 'tw3', 'terabox3']

export default handler