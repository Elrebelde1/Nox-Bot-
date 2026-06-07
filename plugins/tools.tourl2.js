/**
 * 📂 COMANDO: Uchiha Cloud Upload Unified
 * 📝 DESCRIPCIÓN: Aloja imágenes y archivos multimedia en múltiples servidores de la nube de forma dinámica.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import FormData from "form-data"
import fetch from "node-fetch"
import { fileTypeFromBuffer } from "file-type"
import crypto from "crypto"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.uchihaUploads = conn.uchihaUploads || {}

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let urlImagen = text ? text.split(' ')[0] : (m.quoted && m.quoted.text ? m.quoted.text.split(' ')[0] : '')

    let tieneServidor = text && text.includes('-server:')
    let servidorSeleccionado = 'auto'

    if (tieneServidor) {
        servidorSeleccionado = text.split('-server:')[1].trim()
    }

    // ---------------------------------------------------------
    // FLUJO INICIAL: Guardar multimedia y mostrar menú de texto compatible
    // ---------------------------------------------------------
    if (!tieneServidor && (/^https?:\/\//i.test(urlImagen) || mime)) {
        if (mime) {
            try {
                let bufferMedia = await q.download()
                conn.uchihaUploads[m.sender] = {
                    buffer: bufferMedia,
                    mime: mime
                }
            } catch (err) {
                console.error(err)
            }
        }

        // Menú en formato de texto limpio para evitar el bloqueo de botones de Baileys
        let menuTexto = `☁️ *UCHIHA CLOUD UPLOAD*\n\n`
        menuTexto += `Responda a este mensaje o use el comando copiando uno de los siguientes servidores para alojar su archivo:\n\n`
        menuTexto += `⚙️ *Opciones Disponibles:*\n`
        menuTexto += `🔹 *Automático:* \`${usedPrefix + command} ${urlImagen} -server:auto\`\n`
        menuTexto += `🔹 *Evogb.win:* \`${usedPrefix + command} ${urlImagen} -server:evogb\`\n`
        menuTexto += `🔹 *Catbox.moe:* \`${usedPrefix + command} ${urlImagen} -server:catbox\`\n`
        menuTexto += `🔹 *Uguu.se:* \`${usedPrefix + command} ${urlImagen} -server:uguu\`\n`
        menuTexto += `🔹 *Qu.ax:* \`${usedPrefix + command} ${urlImagen} -server:quax\`\n`
        menuTexto += `🔹 *Zenzxz:* \`${usedPrefix + command} ${urlImagen} -server:zenzxz\`\n`
        menuTexto += `🔹 *Top4top.io:* \`${usedPrefix + command} ${urlImagen} -server:top4top\`\n`
        menuTexto += `🔹 *Put.icu:* \`${usedPrefix + command} ${urlImagen} -server:puticu\`\n`
        menuTexto += `🔹 *Adoolab:* \`${usedPrefix + command} ${urlImagen} -server:adoolab\`\n\n`
        menuTexto += `💡 _Si no elige ningún servidor y solo envía ${usedPrefix + command}, se subirá en modo Automático automáticamente._\n\n`
        menuTexto += `⛩️ *𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕*\n👤 *𝖢𝗋𝖾𝖺𝖽𝗈𝗋: 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓*`

        return conn.reply(m.chat, menuTexto, m)
    }

    let cacheMedia = conn.uchihaUploads[m.sender]

    if (!/^https?:\/\//i.test(urlImagen) && !mime && !cacheMedia) {
        return conn.reply(m.chat, `💡 *Uso correcto:*\nResponde a una imagen o ingresa un enlace usando:\n> *${usedPrefix + command} [enlace]*`, m)
    }

    const endpoint = "https://api.evogb.org/tools/upload"
    const claveOculta = Buffer.from("c2FzdWtl", 'base64').toString('utf-8')

    // ---------------------------------------------------------
    // METODO 1: VIA LINK / ENLACE (GET)
    // ---------------------------------------------------------
    if (/^https?:\/\//i.test(urlImagen) && !mime) {
        await m.react('☁️')
        try {
            const queryUrl = `${endpoint}?key=${claveOculta}&method=url&server=${servidorSeleccionado}&url=${encodeURIComponent(urlImagen)}`
            let response = await fetch(queryUrl)
            let datosJson = await response.json()

            if (datosJson && datosJson.status === true && datosJson.url) {
                await m.react('🔥')
                return conn.reply(m.chat, `🚀 *UPLOAD REMOTE SUCCESS*\n\n🔗 *ENLACE:* ${datosJson.url}\n📡 *SERVIDOR:* ${datosJson.server || servidorSeleccionado}\n\n⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓\n⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕`, m)
            } else {
                await m.react('❌')
                return conn.reply(m.chat, `❌ Error en el servidor remoto de evogb.org.\n🔴 ${datosJson?.message || 'Sin respuesta'}`, m)
            }
        } catch (e) {
            console.error(e)
            await m.react('❌')
        }
    } 
    // ---------------------------------------------------------
    // METODO 2: VIA RESPUESTA A IMAGEN / PROCESAMIENTO (POST)
    // ---------------------------------------------------------
    else if (mime || cacheMedia) {
        await m.react('⏳')
        try {
            let bufferMedia = mime ? await q.download() : cacheMedia.buffer
            let currentMime = mime ? mime : cacheMedia.mime

            if (mime) {
                conn.uchihaUploads[m.sender] = {
                    buffer: bufferMedia,
                    mime: mime
                }
            }

            const fileInfo = await fileTypeFromBuffer(bufferMedia) || { ext: 'bin', mime: currentMime || 'application/octet-stream' }

            const extOverrides = {
                'application/vnd.android.package-archive': 'apk',
                'application/x-rar-compressed': 'rar',
                'application/x-7z-compressed': '7z',
                'application/x-tar': 'tar',
            }

            const ext = extOverrides[fileInfo.mime] || fileInfo.ext
            const filename = 'media-' + crypto.randomBytes(8).toString('hex') + '.' + ext

            let formulario = new FormData()
            formulario.append('file', bufferMedia, { filename, contentType: fileInfo.mime })
            formulario.append('method', 'local')
            formulario.append('server', servidorSeleccionado)

            const queryLocal = `${endpoint}?key=${claveOculta}`
            let respuestaServidor = await fetch(queryLocal, {
                method: 'POST',
                body: formulario,
                headers: {
                    ...formulario.getHeaders(),
                    'User-Agent': 'Mozilla/5.0'
                }
            })
            let datosJsonLocal = await respuestaServidor.json()

            if (datosJsonLocal && datosJsonLocal.status === true && datosJsonLocal.url) {
                // Limpieza del almacenamiento temporal tras una subida exitosa
                delete conn.uchihaUploads[m.sender]
                await m.react('🔥')
                return conn.reply(m.chat, `⚡ *UPLOAD LOCAL SUCCESS*\n\n🔗 *ENLACE:* ${datosJsonLocal.url}\n📡 *SERVIDOR:* ${datosJsonLocal.server || servidorSeleccionado}\n\n⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓\n⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕`, m)
            } else {
                await m.react('❌')
                return conn.reply(m.chat, `❌ No se pudo procesar la subida binaria del archivo.\n🔴 ${datosJsonLocal?.message || 'Sin respuesta válida'}`, m)
            }
        } catch (err) {
            console.error(err)
            await m.react('❌')
        }
    }
}

handler.help = ['upload', 'tourl']
handler.tags = ['tools']
handler.command = /^(upload|tourl|subir)$/i

export default handler
