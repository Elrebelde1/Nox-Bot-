/**
 * 📂 COMANDO: Uchiha RemoveBG File
 * 📝 DESCRIPCIÓN: Remueve el fondo de una imagen respondiendo al archivo multimedia directamente en el chat.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import FormData from "form-data"
import fetch from "node-fetch"

const handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!/image/.test(mime)) {
        let panelArchivo = `🎨 ═══ 〖 𝖱𝖤𝖬𝖮𝖵𝖤𝖡𝖦 𝖥𝖨𝖫𝖤 𝖯𝖱𝖮𝖢𝖤𝖲𝖲 〗 ═══ 🎨\n\n`
        panelArchivo += `⚠️ *ESTADO:* No se ha detectado ningún archivo de imagen.\n`
        panelArchivo += `⚠️ *REQUISITO:* Responda o envíe una imagen con el comando *${usedPrefix + command}* para limpiar su fondo.\n`
        panelArchivo += `■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■`
        return conn.reply(m.chat, panelArchivo, m)
    }

    await m.react('⏳')

    try {
        let mediaImg = await q.download()
        const endpointFile = "https://api.evogb.org/tools/removebg"
        const tokenOculto = Buffer.from("c2FzdWtl", 'base64').toString('utf-8')

        let formulario = new FormData()
        formulario.append('image', mediaImg, { filename: 'image.jpg' })

        let respuestaServidor = await fetch(`${endpointFile}?key=${tokenOculto}`, {
            method: 'POST',
            body: formulario,
            headers: formulario.getHeaders()
        })

        if (!respuestaServidor.ok) {
            await m.react('❌')
            return conn.reply(m.chat, `❌ Ocurrió un fallo en el procesamiento del archivo binario.`, m)
        }

        let bufferResultado = await respuestaServidor.buffer()

        await conn.sendMessage(m.chat, { 
            image: bufferResultado, 
            caption: `💥 *Fondo eliminado correctamente del archivo enviado* 💥` 
        }, { quoted: m })

        await m.react('🔥')

    } catch (err) {
        console.error(err)
        await m.react('❌')
    }
}

handler.help = ['removebg']
handler.tags = ['tools']
handler.command = /^(removebg|rbg)$/i

export default handler
