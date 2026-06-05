/**
 * 📂 COMANDO: Uchiha Cloud Upload Unified
 * 📝 DESCRIPCIÓN: Sube imágenes a la nube de evogb de forma automática (soporta enlaces URL y respuestas a fotos).
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import FormData from "form-data"
import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let urlImagen = text || (m.quoted && m.quoted.text ? m.quoted.text : '')

    // Validación unificada para asegurar que haya una entrada válida
    if (!/^https?:\/\//i.test(urlImagen) && !/image/.test(mime)) {
        let panelCarga = `☁️ ━━━ 【 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖣𝖤 𝖢𝖠𝖱𝖦𝖠 𝖴𝖢𝖧𝖨𝖧𝖠 】 ━━━ ☁️\n\n`
        panelCarga += `⬡ *ESTADO:* Esperando recurso para alojamiento...\n`
        panelCarga += `⬡ *MODOS COMPATIBLES:* \n`
        panelCarga += `   1️⃣ Proporcionar un enlace de imagen en texto.\n`
        panelCarga += `   2️⃣ Responder a una imagen/foto con el comando.\n\n`
        panelCarga += `📌 *EJEMPLO POR LINK:* \n`
        panelCarga += `> ${usedPrefix + command} https://files.evogb.win/RtDea5.jpgnn`
        panelCarga += `📌 *EJEMPLO POR FOTO:* \n`
        panelCarga += `> Responde a una foto usando: *${usedPrefix + command}*\n`
        panelCarga += `☁️━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━☁️`
        return conn.reply(m.chat, panelCarga, m)
    }

    const endpoint = "https://api.evogb.org/tools/upload"
    const claveOculta = Buffer.from("c2FzdWtl", 'base64').toString('utf-8')

    // ==========================================
    // MODO 1: ALOJAMIENTO VÍA ENLACE (URL)
    // ==========================================
    if (/^https?:\/\//i.test(urlImagen)) {
        await m.react('☁️')
        try {
            // Estructura exacta con parámetros: server=auto, method=url, url y key
            const queryUrl = `${endpoint}?server=auto&method=url&url=${encodeURIComponent(urlImagen)}&key=${claveOculta}`
            
            let response = await fetch(queryUrl)
            let datosJson = await response.json()

            if (datosJson && datosJson.status === true && datosJson.url) {
                let enlaceFinal = datosJson.url
                let servidorAsignado = datosJson.server || 'auto-select'

                let reporteUrl = `🚀 ━━━ 【 𝖴𝖯𝖫𝖮𝖠𝖣 𝖱𝖤𝖬𝖮𝖳𝖤 𝖲𝖴𝖢𝖢𝖤𝖲𝖲 】 ━━━ 🚀\n\n`
                reporteUrl += `⬡ *𝖤𝖭𝖫𝖠𝖢𝖤 𝖦𝖤𝖭𝖤𝖱𝖠𝖣𝖮:* ${enlaceFinal}\n`
                reporteUrl += `⬡ *𝖲𝖤𝖱𝖵𝖨𝖣𝖮𝖱:* ${servidorAsignado}\n`
                reporteUrl += `⬡ *𝖤𝖲𝖳𝖠𝖣𝖮:* Redirección remota completada\n`
                reporteUrl += `🚀━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🚀`

                await conn.reply(m.chat, reporteUrl, m)
                await m.react('🔥')
            } else {
                await m.react('❌')
                return conn.reply(m.chat, `❌ El servidor remoto no pudo procesar o replicar la URL de la imagen.`, m)
            }
        } catch (e) {
            console.error(e)
            await m.react('❌')
        }
    } 
    // ==========================================
    // MODO 2: ALOJAMIENTO VÍA ARCHIVO LOCAL (FOTO RESPONDIDA)
    // ==========================================
    else if (/image/.test(mime)) {
        await m.react('⏳')
        try {
            let bufferImagen = await q.download()
            let formulario = new FormData()
            
            // Adjuntamos el archivo binario en el parámetro correspondiente
            formulario.append('image', bufferImagen, { filename: 'upload_media.jpg', mimetype: mime })

            // Petición POST con el parámetro de la key
            const queryLocal = `${endpoint}?key=${claveOculta}`

            let respuestaServidor = await fetch(queryLocal, {
                method: 'POST',
                body: formulario,
                headers: formulario.getHeaders()
            })

            let datosJsonLocal = await respuestaServidor.json()

            if (datosJsonLocal && datosJsonLocal.status === true && datosJsonLocal.url) {
                let enlaceFinalLocal = datosJsonLocal.url
                let servidorAsignadoLocal = datosJsonLocal.server || 'auto-select'

                let reporteLocal = `⚡ ━━━ 【 𝖴𝖯𝖫𝖮A𝖣 𝖫𝖮𝖢A𝖫 𝖲𝖴𝖢𝖢𝖤𝖲𝖲 】 ━━━ ⚡\n\n`
                reporteLocal += `⬡ *𝖤𝖭𝖫A𝖢𝖤 𝖦𝖤𝖭𝖤𝖱A𝖣𝖮:* ${enlaceFinalLocal}\n`
                reporteLocal += `⬡ *𝖲𝖤𝖱𝖵𝖨𝖣𝖮𝖱:* ${servidorAsignadoLocal}\n`
                reporteLocal += `⬡ *𝖤𝖲𝖳A𝖣𝖮:* Archivo local binario indexado\n`
                reporteLocal += `⚡━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⚡`

                await conn.reply(m.chat, reporteLocal, m)
                await m.react('🔥')
            } else {
                await m.react('❌')
                return conn.reply(m.chat, `❌ Error de subida: No se recibió un enlace válido del almacenamiento local.`, m)
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
