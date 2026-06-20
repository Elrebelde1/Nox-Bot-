/**
 * 📂 COMANDO: Uchiha YouTube MP4 Downloader
 * 📝 DESCRIPCIÓN: Extrae y descarga el video de YouTube con el mapeo del JSON de la API.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */
import fetch from "node-fetch"

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const key = Buffer.from('c2FzdWtl', 'base64').toString('utf-8')
    if (!text) return conn.reply(m.chat, `*☁️ Uchiha Cloud Download*\n\n*Uso correcto:*\n> *${usedPrefix + command} https://youtu.be/XXXXXX*`, m)

    await m.react('⏳')
    try {
        let resDl = await fetch(`https://api.evogb.org/dl/ytmp4?url=${encodeURIComponent(text)}&quality=1080&key=${key}`)
        let jsonDl = await resDl.json()
        if (!jsonDl.status || !jsonDl.data || !jsonDl.data.dl) {
            await m.react('❌')
            return m.reply('❌ Error al procesar la descarga del video de YouTube.')
        }

        let { title, thumbnail, dl, quality } = jsonDl.data
        let info = `*☁️ Uchiha Cloud - Video Localizado*\n\n📌 *Título:* ${title || 'Desconocido'}\n🎬 *Calidad:* ${quality || '1080p'}\n\n📂 *COMANDO:* Uchiha YouTube MP4 Downloader\n👤 *CREADOR:* Barboza Developer\n⚡ *CANAL:* Barboza Developer x Zona Developers\n🔌 *API:* https://api.evogb.org`

        await conn.sendMessage(m.chat, { 
            video: { url: dl }, 
            mimetype: 'video/mp4', 
            caption: info, 
            thumbnail: thumbnail ? await (await fetch(thumbnail)).buffer() : null 
        }, { quoted: m })
        
        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        m.reply('❌ Ocurrió un error interno en los servidores de Uchiha Cloud.')
    }
}

handler.help = ['ytmp4']
handler.tags = ['downloader']
handler.command = /^(ytmp4v2|ytv|playmp4)$/i

export default handler
