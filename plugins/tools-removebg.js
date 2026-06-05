/**
 * 📂 COMANDO: Uchiha RemoveBG Unified
 * 📝 DESCRIPCIÓN: Quita el fondo de una imagen de forma automática (soporta enlaces URL y respuestas a fotos).
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

    // Verificar si no hay texto/enlace Y tampoco hay una imagen respondida
    if (!/^https?:\/\//i.test(urlImagen) && !/image/.test(mime)) {
        let panelUnificado = `🔮 ━━━ 【 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖱𝖤𝖬𝖮𝖵𝖤𝖡𝖦 𝖴𝖭𝖨𝖥𝖨𝖢𝖠𝖣𝖮 】 ━━━ 🔮\n\n`
        panelUnificado += `⬡ *ESTADO:* Esperando entrada de datos...\n`
        panelUnificado += `⬡ *MODOS SOPORTADOS:* \n`
        panelUnificado += `   1️⃣ Enviar un enlace directo de imagen.\n`
        panelUnificado += `   2️⃣ Responder a una fotografía con el comando.\n\n`
        panelUnificado += `📌 *EJEMPLO POR LINK:* \n`
        panelUnificado += `> ${usedPrefix + command} https://files.evogb.win/n3Yk4J.jpgnn`
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
            let respuesta = await fetch(rutaUrl)
            
            if (!respuesta.ok) {
                await m.react('❌')
                return conn.reply(m.chat, `❌ El servidor denegó la conversión del enlace proporcionado.`, m)
            }

            let bufferImg = await respuesta.buffer()
            await conn.sendMessage(m.chat, { image: bufferImg, caption: `✨ *Fondo removido exitosamente vía URL* ✨` }, { quoted: m })
            await m.react('🔥')
        } catch (e) {
            console.error(e)
            await m.react('❌')
        }
    } 
    // MODO 2: PROCESAMIENTO POR ARCHIVO LOCAL (FOTO RESPONDIDA)
    else if (/image/.test(mime)) {
        await m.react('⏳')
        try {
            let imgBuffer = await q.download()
            let bodyForm = new FormData()
            bodyForm.append('image', imgBuffer, { filename: 'file_input.jpg', mimetype: 'image/jpeg' })

            const rutaLocal = `${endpoint}?method=local&key=${claveOculta}`
            let postRequest = await fetch(rutaLocal, {
                method: 'POST',
                body: bodyForm,
                headers: bodyForm.getHeaders()
            })

            if (!postRequest.ok) {
                await m.react('❌')
                return conn.reply(m.chat, `❌ El servidor rechazó el procesamiento del archivo local enviado.`, m)
            }

            let outputBuffer = await postRequest.buffer()
            await conn.sendMessage(m.chat, { image: outputBuffer, caption: `💥 *Fondo eliminado del archivo local correctamente* 💥` }, { quoted: m })
            await m.react('🔥')
        } catch (err) {
            console.error(err)
            await m.react('❌')
        }
    }
}

handler.help = ['removebg', 'rbg']
handler.tags = ['tools']
handler.command = /^(removebg|rbg|rbglink|removebglink)$/i

export default handler
