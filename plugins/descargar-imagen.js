/**
 * Code: AI Visual / Image Generator
 * Función: Permite analizar imágenes mediante una URL o generar nuevas 
 * imágenes artísticas a partir de texto.
 * * Code creado por Barboza Developer
 * Se te agradece dejar los créditos.
 * Disfruta el código de Barboza Developer x Zona Developers.
 */

import fetch from "node-fetch"
import uploadImage from '../lib/uploadImage.js'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    const isDraw = command === 'draw'

    if (isDraw) {
        if (!text) return m.reply(`*Ingrese la descripción para generar la imagen*\n\n*Ejemplo:* ${usedPrefix}${command} un lobo en la nieve`)
        await m.react('🎨')
        try {
            const res = await fetch(`https://api.delirius.store/ia/midjourney?query=${encodeURIComponent(text)}`)
            const json = await res.json()
            if (!json.status) throw new Error()

            await conn.sendMessage(m.chat, { 
                image: { url: json.data.image }, 
                caption: `*Resultado:* ${text}` 
            }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            await m.react('❌')
            m.reply('🛑 Error al generar imagen')
        }
        return
    }

    // Lógica para comando Visual (Analizar imagen)
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/image/.test(mime)) return m.reply(`*Responda a una imagen con el comando:* ${usedPrefix}${command} ¿Qué ves en la imagen?`)
    if (!text) return m.reply(`*Ingrese su pregunta sobre la imagen.*`)

    await m.react('👁️')

    try {
        let img = await q.download()
        let url = await uploadImage(img)
        const res = await fetch(`https://api.delirius.store/ia/visual?image=${url}&query=${encodeURIComponent(text)}`)
        const json = await res.json()

        if (!json.status) throw new Error()

        await m.reply(json.data.result)
        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply('🛑 Error al analizar imagen')
    }
}

handler.help = ['visual', 'draw']
handler.tags = ['ia']
handler.command = /^(visual|draw)$/i

export default handler
