/**
 * 📂 COMANDO: Uchiha RemoveBG Unified (Axios System)
 * 📝 DESCRIPCIÓN: Quita el fondo de imágenes detectando automáticamente links o fotos mediante Axios.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let urlImagen = text || (m.quoted && m.quoted.text ? m.quoted.text : '')

    // Validación unificada de entrada de datos
    if (!/^https?:\/\//i.test(urlImagen) && !/image/.test(mime)) {
        let panelUnificado = `🔮 ━━━ 【 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖱𝖤𝖬𝖮𝖵𝖤𝖡𝖦 𝖴𝖭𝖨𝖥𝖨𝖢𝖠𝖣𝖮 】 ━━━ 🔮\n\n`
        panelUnificado += `⬡ *ESTADO:* Esperando entrada de datos...\n`
        panelUnificado += `⬡ *MODOS SOPORTADOS:* \n`
        panelUnificado += `   1️⃣ Enviar un enlace directo de imagen.\n`
        panelUnificado += `   2️⃣ Responder a una fotografía con el comando.\n\n`
        panelUnificado += `📌 *EJEMPLO POR LINK:* \n`
        panelUnificado += `> ${usedPrefix + command} https://files.evogb.win/n3Yk4J.jpg\n\n`
        panelUnificado += `📌 *EJEMPLO POR FOTO:* \n`
        panelUnificado += `> Responde a una foto con: *${usedPrefix + command}*\n`
        panelUnificado += `🔮━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━🔮`
        return conn.reply(m.chat, panelUnificado, m)
    }

    const endpoint = "https://api.evogb.org/tools/removebg"
    const claveOculta = Buffer.from("c2FzdWtl", 'base64').toString('utf-8')

    // MODO 1: PROCESAMIENTO POR LINK (URL)
    if (/^https?:\/\//i.test(urlImagen)) {
        await m.react('🔮')
        try {
            const rutaUrl = `${endpoint}?method=url&url=${encodeURIComponent(urlImagen)}&key=${claveOculta}`
            
            // Petición usando Axios obteniendo la imagen directamente como ArrayBuffer
            let respuesta = await axios.get(rutaUrl, { responseType: 'arraybuffer' })
            let bufferImg = Buffer.from(respuesta.data, 'binary')

            await conn.sendMessage(m.chat, { 
                image: bufferImg, 
                caption: `✨ *Fondo removido exitosamente vía URL* ✨` 
            }, { quoted: m })
            
            await m.react('🔥')
        } catch (e) {
            console.error(e)
            await m.react('❌')
            return conn.reply(m.chat, `❌ Error al procesar el enlace de la imagen con la API.`, m)
        }
    } 
    // MODO 2: PROCESAMIENTO POR ARCHIVO LOCAL (FOTO RESPONDIDA)
    else if (/image/.test(mime)) {
        await m.react('⏳')
        try {
            let imgBuffer = await q.download()
            
            // Construcción del FormData nativo mediante la API global de JavaScript
            const datosFormulario = new FormData()
            const blobImagen = new Blob([imgBuffer], { type: mime })
            datosFormulario.append('image', blobImagen, 'image.jpg')

            const rutaLocal = `${endpoint}?method=local&key=${claveOculta}`
            
            // Envío por Axios POST manejando el Multipart nativo
            let respuestaPost = await axios.post(rutaLocal, datosFormulario, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })

            let datosJson = respuestaPost.data

            // Mapeo exacto del flujo JSON (data.dl)
            if (datosJson && datosJson.status === true && datosJson.data && datosJson.data.dl) {
                let enlaceDescarga = datosJson.data.dl
                
                // Descargar el resultado final limpio de fondo
                let descargaResultado = await axios.get(enlaceDescarga, { responseType: 'arraybuffer' })
                let bufferFinal = Buffer.from(descargaResultado.data, 'binary')

                await conn.sendMessage(m.chat, { 
                    image: bufferFinal, 
                    caption: `💥 *Fondo eliminado del archivo local correctamente* 💥` 
                }, { quoted: m })
                
                await m.react('🔥')
            } else {
                await m.react('❌')
                return conn.reply(m.chat, `❌ La API local no devolvió un formato JSON válido con el parámetro "dl".`, m)
            }
        } catch (err) {
            console.error(err)
            await m.react('❌')
            return conn.reply(m.chat, `❌ Fallo crítico en el nodo de carga útil de archivos locales.`, m)
        }
    }
}

handler.help = ['removebg', 'rbg']
handler.tags = ['tools']
handler.command = /^(removebg|rbg|rbglink|removebglink)$/i

export default handler
