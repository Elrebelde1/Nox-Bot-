/**
 * 📂 COMANDO: Uchiha AI Image Upscaler
 * 📝 DESCRIPCIÓN: Incrementa la resolución, restaura detalles y mejora la calidad visual de las imágenes a HD mediante IA.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import FormData from "form-data"
import fetch from "node-fetch"
import { fileTypeFromBuffer } from "file-type"
import crypto from "crypto"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let urlImagen = text ? text.split(' ')[0] : (m.quoted && m.quoted.text ? m.quoted.text.split(' ')[0] : '')

    if (!/^https?:\/\//i.test(urlImagen) && !mime) {
        return conn.reply(m.chat, `💡 *Uso correcto:*\nResponde a una imagen o ingresa un enlace directo para mejorar su resolución:\n> *${usedPrefix + command} [enlace]*`, m)
    }

    const endpoint = "https://api.evogb.org/tools/upscale"
    const key = "sasuke"

    // ---------------------------------------------------------
    // METODO 1: URL (Enlace remoto via GET)
    // ---------------------------------------------------------
    if (/^https?:\/\//i.test(urlImagen)) {
        await m.react('☁️')
        try {
            const queryUrl = `${endpoint}?method=url&url=${encodeURIComponent(urlImagen)}&key=${key}`
            let response = await fetch(queryUrl)
            
            const contentType = response.headers.get('content-type')
            if (contentType && contentType.includes('image')) {
                let imageBuffer = await response.buffer()
                await m.react('🔥')
                return conn.sendMessage(m.chat, { image: imageBuffer, caption: `⚡ *IMAGE UPSCALE REMOTE SUCCESS*\n\n✨ Calidad mejorada con éxito mediante Inteligencia Artificial.\n\n⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓\n⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕` }, { quoted: m })
            }

            let datosJson = await response.json()
            if (datosJson && datosJson.status === true && datosJson.url) {
                await m.react('🔥')
                return conn.sendMessage(m.chat, { image: { url: datosJson.url }, caption: `⚡ *IMAGE UPSCALE REMOTE SUCCESS*\n\n⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓\n⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕` }, { quoted: m })
            } else {
                await m.react('❌')
                return conn.reply(m.chat, `❌ Error en el procesamiento del enlace remoto.\n🔴 ${datosJson?.message || 'Sin respuesta válida'}`, m)
            }
        } catch (e) {
            console.error(e)
            await m.react('❌')
            return conn.reply(m.chat, `❌ Ocurrió un fallo en la conexión con el servicio remoto de escalado.`, m)
        }
    } 
    // ---------------------------------------------------------
    // METODO 2: LOCAL (Subir archivo via POST)
    // ---------------------------------------------------------
    else if (mime) {
        if (!/image/.test(mime)) return conn.reply(m.chat, `❌ El archivo proporcionado debe ser estrictamente una imagen.`, m)
        
        await m.react('⏳')
        try {
            let bufferMedia = await q.download()
            const fileInfo = await fileTypeFromBuffer(bufferMedia) || { ext: 'jpg', mime: 'image/jpeg' }
            const filename = 'upscale-' + crypto.randomBytes(8).toString('hex') + '.' + fileInfo.ext

            let formulario = new FormData()
            // Ajuste de parámetros requeridos por la interfaz de la API
            formulario.append('method', 'local')
            formulario.append('image', bufferMedia, { filename, contentType: fileInfo.mime })

            const queryLocal = `${endpoint}?key=${key}`
            let respuestaServidor = await fetch(queryLocal, {
                method: 'POST',
                body: formulario,
                headers: {
                    ...formulario.getHeaders(),
                    'User-Agent': 'Mozilla/5.0'
                }
            })

            const contentType = respuestaServidor.headers.get('content-type')
            if (contentType && contentType.includes('image')) {
                let upscaleBuffer = await respuestaServidor.buffer()
                await m.react('🔥')
                return conn.sendMessage(m.chat, { image: upscaleBuffer, caption: `⚡ *IMAGE UPSCALE LOCAL SUCCESS*\n\n✨ Resolución y detalles optimizados con éxito (5-15 seg).\n\n⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓\n⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕` }, { quoted: m })
            }

            let datosJsonLocal = await respuestaServidor.json()
            if (datosJsonLocal && datosJsonLocal.status === true && datosJsonLocal.url) {
                await m.react('🔥')
                return conn.sendMessage(m.chat, { image: { url: datosJsonLocal.url }, caption: `⚡ *IMAGE UPSCALE LOCAL SUCCESS*\n\n⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓\n⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕` }, { quoted: m })
            } else {
                await m.react('❌')
                return conn.reply(m.chat, `❌ El servidor no procesó la imagen local.\n🔴 ${datosJsonLocal?.message || 'Error desconocido'}`, m)
            }
        } catch (err) {
            console.error(err)
            await m.react('❌')
            return conn.reply(m.chat, `❌ Falló la subida binaria o el tiempo de espera del Upscaler expiró.`, m)
        }
    }
}

handler.help = ['hd', 'upscale', 'remini']
handler.tags = ['tools', 'ai']
handler.command = /^(hd|upscale|remini|mejorar)$/i

export default handler
