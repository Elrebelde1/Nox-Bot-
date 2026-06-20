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
            return m.reply('❌ Error al obtener el enlace de la API.')
        }

        let { name, size, date, type, dl } = jsonDl.data
        let info = `*☁️ Uchiha Cloud - Archivo Localizado*\n\n📌 *Nombre:* ${name}\n📦 *Peso:* ${size}\n📅 *Fecha:* ${date || 'Desconocida'}\n🗂️ *Tipo:* ${type || 'Desconocido'}\n\n_Descargando archivo e inyectando bypass..._`

        await conn.reply(m.chat, info, m)
        
        // Descargamos el archivo enviando un User-Agent simulando un navegador para evitar los 36KB de bloqueo
        let resFile = await fetch(dl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })
        
        if (!resFile.ok) throw new Error('Error al descargar el archivo físico.')
        let buffer = await resFile.buffer()
        
        await conn.sendMessage(m.chat, { 
            document: buffer, 
            mimetype: 'application/octet-stream', 
            fileName: name
        }, { quoted: m })
        
        await m.react('✅')
    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('❌ Ocurrió un error al forzar la descarga del archivo binario.')
    }
}

handler.help = ['mediafire']
handler.tags = ['downloader']
handler.command = /^(mediafire|mf|mediafiredl)$/i

export default handler
