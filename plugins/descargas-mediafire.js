/**
 * 📂 COMANDO: Nexus MediaFire Downloader
 * 📝 DESCRIPCIÓN: Descarga directa y procesamiento de archivos desde MediaFire.
 * 👤 DESARROLLADOR: Barboza Developer
 * ⚡ PROYECTO: Nexus Bot Engine
 */
import fetch from "node-fetch"

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const key = Buffer.from('c2FzdWtl', 'base64').toString('utf-8')
    if (!text) return conn.reply(m.chat, `*📥 Nexus MediaFire*\n\n*Formato:* ${usedPrefix + command} [link]`, m)

    await m.react('📥')
    try {
        let response = await fetch(`https://api.evogb.org/dl/mediafire?url=${encodeURIComponent(text)}&key=${key}`)
        let result = await response.json()
        
        if (!result.status || !result.data) {
            await m.react('⚠️')
            return m.reply('❌ No se pudo localizar el archivo. Verifica el enlace.')
        }

        let { name, size, date, dl } = result.data
        let caption = `*📂 ARCHIVO RECUPERADO*\n\n` +
                      `🏷 *Nombre:* ${name}\n` +
                      `⚖ *Tamaño:* ${size}\n` +
                      `📅 *Fecha:* ${date}\n\n` +
                      `> _Procesando descarga desde Nexus Engine..._`

        await conn.sendFile(m.chat, dl, name, caption, m)
        await m.react('✅')
        
    } catch (e) {
        await m.react('❌')
        m.reply('❌ Error crítico en el servidor de descarga.')
    }
}

handler.help = ['mediafire']
handler.tags = ['downloader']
handler.command = /^(mediafire|mf|mediafiredl)$/i

export default handler
