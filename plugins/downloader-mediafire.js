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
        let info = `*☁️ Uchiha Cloud - Archivo Localizado*\n\n📌 *Nombre:* ${name}\n📦 *Peso:* ${size}\n📅 *Fecha:* ${date || 'Desconocida'}\n🗂️ *Tipo:* ${type || 'Desconocido'}\n\n📂 *COMANDO:* Uchiha MediaFire Downloader\n👤 *CREADOR:* Barboza Developer\n⚡ *CANAL:* Barboza Developer x Zona Developers\n🔌 *API:* https://api.evogb.org`

        await conn.reply(m.chat, info, m)
        
        // CORRECCIÓN: Descargamos el archivo real en memoria (Buffer) para evitar el archivo corrupto de 36kb
        let fileResponse = await fetch(dl)
        if (!fileResponse.ok) throw new Error('Error al descargar el archivo desde la URL directa')
        let fileBuffer = await fileResponse.buffer()

        // Enviamos el Buffer descargado
        await conn.sendMessage(m.chat, { 
            document: fileBuffer, 
            mimetype: 'application/octet-stream', 
            fileName: name
        }, { quoted: m })
        
        await m.react('✅')
    } catch (e) {
        console.error(e) // Imprime el error real en tu consola para monitoreo
        await m.react('❌')
        m.reply('❌ Ocurrió un error interno al procesar o descargar el archivo.')
    }
}

handler.help = ['mediafire']
handler.tags = ['downloader']
handler.command = /^(mediafire|mf|mediafiredl)$/i

export default handler
