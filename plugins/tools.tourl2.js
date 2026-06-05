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
    
    // Extraer texto limpio omitiendo parámetros internos del servidor
    let textoLimpio = text ? text.replace(/-server:\S+/i, '').trim() : ''
    let urlImagen = textoLimpio ? textoLimpio.split(' ')[0] : (m.quoted && m.quoted.text ? m.quoted.text.split(' ')[0] : '')
    
    let servidorSeleccionado = 'auto'
    if (text && text.includes('-server:')) {
        servidorSeleccionado = text.split('-server:')[1].trim()
    }

    // Si no hay una imagen real presente y tampoco se detecta un enlace válido en el texto, abrimos el menú
    if (!/image/.test(mime) && !/^https?:\/\//i.test(urlImagen)) {
        const msgBoton = {
            text: `☁️ *UCHIHA CLOUD UPLOAD*\n\nSeleccione en el botón de abajo el servidor donde desea alojar su archivo o enlace de imagen.`,
            footer: "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕\n👤 𝖢𝗋𝖾𝖺𝖽𝗈 r: 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓",
            title: "SISTEMA DE ALOJAMIENTO",
            buttonText: "Ver Servidores",
            sections: [{
                title: "Opciones Disponibles",
                rows: [
                    { title: "Automático", description: "Selección óptima del sistema", rowId: `${usedPrefix + command} ${urlImagen} -server:auto`.trim() },
                    { title: "Evogb.win", description: "Almacenamiento Permanente", rowId: `${usedPrefix + command} ${urlImagen} -server:evogb`.trim() },
                    { title: "Catbox.moe", description: "Almacenamiento Permanente", rowId: `${usedPrefix + command} ${urlImagen} -server:catbox`.trim() },
                    { title: "Uguu.se", description: "Almacenamiento Temporal", rowId: `${usedPrefix + command} ${urlImagen} -server:uguu`.trim() },
                    { title: "Qu.ax", description: "Almacenamiento Temporal", rowId: `${usedPrefix + command} ${urlImagen} -server:quax`.trim() },
                    { title: "zenzxz", description: "Almacenamiento Permanente", rowId: `${usedPrefix + command} ${urlImagen} -server:zenzxz`.trim() },
                    { title: "top4top.io", description: "Almacenamiento Temporal", rowId: `${usedPrefix + command} ${urlImagen} -server:top4top`.trim() },
                    { title: "put.icu", description: "Almacenamiento Temporal 24H", rowId: `${usedPrefix + command} ${urlImagen} -server:put`.trim() },
                    { title: "Adoolab", description: "Almacenamiento Permanente", rowId: `${usedPrefix + command} ${urlImagen} -server:adoolab`.trim() }
                ]
            }]
        }
        return conn.sendMessage(m.chat, msgBoton, { quoted: m })
    }

    const endpoint = "https://api.evogb.org/tools/upload"
    const claveOculta = Buffer.from("c2FzdWtl", 'base64').toString('utf-8')

    // PRIORIDAD 1: Si hay un archivo binario de imagen (ej. respondiendo a una foto como en la captura 1000785414.jpg)
    if (/image/.test(mime)) {
        await m.react('⏳')
        try {
            let bufferImagen = await q.download()
            let formulario = new FormData()
            formulario.append('image', bufferImagen, { filename: 'upload_media.jpg', mimetype: mime })

            const queryLocal = `${endpoint}?server=${servidorSeleccionado}&key=${claveOculta}`
            let respuestaServidor = await fetch(queryLocal, {
                method: 'POST',
                body: formulario,
                headers: formulario.getHeaders()
            })
            let datosJsonLocal = await respuestaServidor.json()

            if (datosJsonLocal && datosJsonLocal.status === true && datosJsonLocal.url) {
                await conn.reply(m.chat, `⚡ *UPLOAD LOCAL SUCCESS*\n\n🔗 *ENLACE:* ${datosJsonLocal.url}\n📡 *SERVIDOR:* ${datosJsonLocal.server || servidorSeleccionado}\n\n⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓\n⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕`, m)
                await m.react('🔥')
            } else {
                await m.react('❌')
                return conn.reply(m.chat, `❌ No se pudo procesar la subida binaria de la imagen.`, m)
            }
        } catch (err) {
            console.error(err)
            await m.react('❌')
        }
    } 
    // PRIORIDAD 2: Si es un enlace de imagen enviado por texto
    else if (/^https?:\/\//i.test(urlImagen)) {
        await m.react('☁️')
        try {
            const queryUrl = `${endpoint}?server=${servidorSeleccionado}&method=url&url=${encodeURIComponent(urlImagen)}&key=${claveOculta}`
            let response = await fetch(queryUrl)
            let datosJson = await response.json()

            if (datosJson && datosJson.status === true && datosJson.url) {
                await conn.reply(m.chat, `🚀 *UPLOAD REMOTE SUCCESS*\n\n🔗 *ENLACE:* ${datosJson.url}\n📡 *SERVIDOR:* ${datosJson.server || servidorSeleccionado}\n\n⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓\n⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕`, m)
                await m.react('🔥')
            } else {
                await m.react('❌')
                return conn.reply(m.chat, `❌ Error en el servidor remoto de evogb.org.`, m)
            }
        } catch (e) {
            console.error(e)
            await m.react('❌')
        }
    }
}

handler.help = ['upload', 'tourl']
handler.tags = ['tools']
handler.command = /^(upload|tourl|subir)$/i

export default handler
