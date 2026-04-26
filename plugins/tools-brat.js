import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'

var handler = async (m, { conn, usedPrefix, command, text }) => {
    let [txt, color] = text.split('|')
    let textoFinal = txt ? txt.trim() : (m.quoted?.text || null)

    if (!textoFinal) return conn.reply(m.chat, '✨ *Escribe el texto para tu sticker*\n> Ejemplo: .brat Sasuke Bot', m)

    if (textoFinal.length > 35) {
        return conn.reply(m.chat, `⚠️ *Texto muy largo (máximo 35 letras).*`, m)
    }

    // Configuración de colores: Nombre para el botón | Nombre para la API | Emoji
    const menuColores = [
        { nombre: 'Blanco', api: 'Blanco', emoji: '🤍' },
        { nombre: 'Verde', api: 'Verde', emoji: '💚' },
        { nombre: 'Rojo', api: 'Rojo', emoji: '❤️' },
        { nombre: 'Azul', api: 'Azul', emoji: '💙' },
        { nombre: 'Amarillo', api: 'Amarillo', emoji: '💛' },
        { nombre: 'Rosa', api: 'Rosa', emoji: '🩷' },
        { nombre: 'Cian', api: 'Cian', emoji: '🩵' },
        { nombre: 'Naranja', api: 'Naranja', emoji: '🧡' },
        { nombre: 'Morado', api: 'Morado', emoji: '💜' }
    ]

    // Si el usuario no ha elegido color (no hay "|" en el texto), mostramos botones
    if (!color) {
        const botones = menuColores.map(c => ({
            buttonId: `${usedPrefix + command} ${textoFinal}|${c.api}`,
            buttonText: { displayText: `${c.nombre} ${c.emoji}` },
            type: 1
        }))

        const buttonMessage = {
            text: `👤 *𝖲𝖺𝗌𝗎𝗄𝖾 𝖡𝗈𝗍 𝖬𝖣 — 𝖡𝗋𝖺𝗍 𝖢𝗈𝗅𝗈𝗋*\n\n📝 *Texto:* ${textoFinal}\n\n*Seleccione el color de fondo para su sticker:*`,
            footer: "𝖡𝗒 𝖡𝖺𝗋𝖻𝗈𝗓𝖺-𝖳𝖾𝖺𝗆 ⚡",
            buttons: botones,
            headerType: 1
        }
        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }

    let { key } = await conn.sendMessage(m.chat, { text: `💎 *Generando sticker Brat (${color.trim()})...*` }, { quoted: m })

    try {
        await m.react('🕒')

        const apiKey = "sylphy-6f150d"
        const fondoElegido = color.trim() // Viene del buttonId (ej: "Verde")
        
        // Llamada a la API con el fondo dinámico
        const apiUrl = `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(textoFinal)}&color=Negro&fondo=${fondoElegido}&type=Nose&api_key=${apiKey}`

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })

        const img = `./tmp-${Date.now()}.png`
        const webp = `./tmp-${Date.now()}.webp`
        fs.writeFileSync(img, response.data)

        // Filtros de FFmpeg para dar brillo y nitidez
        const filtroBrillo = `eq=brightness=0.06:saturation=1.6:contrast=1.2,unsharp=5:5:1.0:5:5:0.0`

        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${img} -vf "${filtroBrillo},scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" -vcodec libwebp -lossless 1 ${webp}`, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        await conn.sendMessage(m.chat, { 
            sticker: fs.readFileSync(webp), 
            packname: "𝖲𝖺𝗌𝗎𝗄𝖾 𝖡𝗈𝗍 𝖬𝖣 👤", 
            author: `𝖡𝗋𝖺𝗍 ${fondoElegido} ✨` 
        }, { quoted: m })

        await conn.sendMessage(m.chat, { text: `✅ *¡Sticker ${fondoElegido} finalizado!*`, edit: key })
        await m.react('✔️')

        if (fs.existsSync(img)) fs.unlinkSync(img)
        if (fs.existsSync(webp)) fs.unlinkSync(webp)

    } catch (e) {
        console.error(e)
        await m.react('✖️')
        await conn.sendMessage(m.chat, { text: '❌ *Error al procesar el color o la API.*', edit: key })
    }
}

handler.help = ['brat']
handler.tags = ['sticker']
handler.command = /^(brat|bratcolor)$/i

export default handler
