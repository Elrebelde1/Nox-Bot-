/**
 * 📂 COMANDO: Uchiha AI Image Upscaler
 * 📝 DESCRIPCIÓN: Mejora la calidad de una imagen (Upscale) utilizando los servidores de IA de la API.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */
import fetch from "node-fetch"
import FormData from "form-data"
import crypto from "crypto"

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const key = Buffer.from('c2FzdWtl', 'base64').toString('utf-8')
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let urlTarget = text ? text.trim() : ''

    if (!urlTarget && !/image\/(jpe?g|png)/.test(mime)) {
        return conn.reply(m.chat, `*☁️ Uchiha Cloud AI*\n\n*Uso correcto:*\n> Responde a una imagen, envía una o proporciona un enlace con el comando *${usedPrefix + command}*`, m)
    }

    await m.react('⏳')
    try {
        let finalUrl = urlTarget

        if (!finalUrl && /image\/(jpe?g|png)/.test(mime)) {
            let imgBuffer = await q.download()
            let ext = mime.split('/')[1] || 'jpg'
            let filename = 'media-' + crypto.randomBytes(8).toString('hex') + '.' + ext

            let formulario = new FormData()
            formulario.append('file', imgBuffer, { filename, contentType: mime })

            let resUpload = await fetch(`https://api.evogb.org/tools/upload?key=${key}`, {
                method: 'POST',
                body: formulario,
                headers: {
                    ...formulario.getHeaders(),
                    'User-Agent': 'Mozilla/5.0'
                }
            })
            let jsonUpload = await resUpload.json()
            if (jsonUpload.status && jsonUpload.url) {
                finalUrl = jsonUpload.url
            } else {
                await m.react('❌')
                return m.reply(`❌ Error al subir imagen temporal:\n🔴 ${jsonUpload?.message || 'Sin respuesta'}`)
            }
        }

        let resDl = await fetch(`https://api.evogb.org/tools/upscale?method=url&url=${encodeURIComponent(finalUrl)}&key=${key}`)
        let contentType = resDl.headers.get("content-type")
        
        if (contentType && contentType.includes("application/json")) {
            let jsonDl = await resDl.json()
            await m.react('❌')
            return m.reply(`❌ Error de la API: ${jsonDl.message || 'No se pudo mejorar la imagen.'}`)
        }

        let buffer = await resDl.buffer()
        let info = `*☁️ Uchiha Cloud - Imagen Mejorada*\n\n✨ *Resultado:* Éxito al procesar la imagen con IA.\n\n📂 *COMANDO:* Uchiha AI Image Upscaler\n👤 *CREADOR:* Barboza Developer\n⚡ *CANAL:* Barboza Developer x Zona Developers\n🔌 *API:* https://api.evogb.org`

        await conn.sendMessage(m.chat, { image: buffer, caption: info }, { quoted: m })
        await m.react('✅')
        
    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('❌ Ocurrió un error interno o los servidores de IA se encuentran saturados.')
    }
}

handler.help = ['upscale', 'remini']
handler.tags = ['tools']
handler.command = /^(upscale|remini|hd|mejorar)$/i

export default handler
