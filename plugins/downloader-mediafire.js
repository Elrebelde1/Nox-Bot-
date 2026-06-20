/**
 * 📂 COMANDO: Uchiha MediaFire Downloader
 * 📝 DESCRIPCIÓN: Extrae y descarga archivos de MediaFire con el mapeo del JSON de la API.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */
import fetch from "node-fetch"

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const key = Buffer.from('c2FzdWtl', 'base64').toString('utf-8')
    if (!text) return conn.reply(m.chat, `*☁️ Uchiha Cloud Download*\n\n*Uso correcto:*\n> *${usedPrefix + command} https://www.mediafire.com/file/XXXXXX*`, m)

    await m.react('⏳')
    try {
        let resDl = await fetch(`https://api.evogb.org/dl/mediafire?url=${encodeURIComponent(text)}&key=${key}`)
        let jsonDl = await resDl.json()
        if (!jsonDl.status || !jsonDl.data || !jsonDl.data.dl) {
            await m.react('❌')
            return m.reply('❌ Error al procesar la descarga de MediaFire.')
        }

        let { name, size, date, type, dl } = jsonDl.data
        let info = `*☁️ Uchiha Cloud - Archivo Localizado*\n\n📌 *Nombre:* ${name}\n📦 *Peso:* ${size}\n📅 *Fecha:* ${date || 'Desconocida'}\n🗂️ *Tipo:* ${type || 'Desconocido'}\n\n📂 *COMANDO:* Uchiha MediaFire Downloader\n👤 *CREADOR:* Barboza Developer\n⚡ *CANAL:* Barboza Developer x Zona Developers\n🔌 *API:* https://api.evogb.org`

        await conn.reply(m.chat, info, m)
        
        await conn.sendMessage(m.chat, { 
            document: { url: dl }, 
            mimetype: 'application/octet-stream', 
            fileName: name
        }, { quoted: m })
        
        await m.react('✅')
    } catch (e) {
        await m.react('❌')
        m.reply('❌ Ocurrió un error interno en los servidores de Uchiha Cloud.')
    }
}

handler.help = ['mediafire']
handler.tags = ['downloader']
handler.command = /^(mediafire|mf|mediafiredl)$/i

export default handler
