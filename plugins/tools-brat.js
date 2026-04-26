

import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'

var handler = async (m, { conn, usedPrefix, command, text }) => {
    // Separamos el texto y el color
    let [txt, color] = text.split('|')
    let textoFinal = txt ? txt.trim() : (m.quoted?.text || null)

    if (!textoFinal) return conn.reply(m.chat, '⚡ *Escribe el texto para tu sticker brat*\n> Ejemplo: .brat Sasuke Bot', m)

    // Validación de longitud
    if (textoFinal.length > 35) {
        return conn.reply(m.chat, `⚠️ *Texto muy largo.*\n\n📌 Máximo: *35 letras*`, m)
    }

    // Si no hay color, mandamos los botones con tu marca
    if (!color) {
        const colores = [
            { buttonId: `${usedPrefix + command} ${textoFinal}|blanco`, buttonText: { displayText: "Blanco 🤍" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|verde`, buttonText: { displayText: "Verde 💚" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|rojo`, buttonText: { displayText: "Rojo ❤️" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|azul`, buttonText: { displayText: "Azul 💙" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|amarillo`, buttonText: { displayText: "Amarillo 💛" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|rosa`, buttonText: { displayText: "Rosa 🩷" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|cian`, buttonText: { displayText: "Cian 🩵" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|naranja`, buttonText: { displayText: "Naranja 🧡" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|morado`, buttonText: { displayText: "Morado 💜" }, type: 1 }
        ]

        const buttonMessage = {
            text: `👤 *𝖲𝖺𝗌𝗎𝗄𝖾 𝖡𝗈𝗍 𝖬𝖣 — 𝖡𝗋𝖺𝗍 𝖢𝗈𝗅𝗈𝗋*\n\n📝 *Texto:* ${textoFinal}\n\n*Seleccione el color de fondo:*`,
            footer: "𝖡𝗒 𝖡𝖺𝗋𝖻𝗈𝗓𝖺-𝖳𝖾𝖺𝗆 ⚡",
            buttons: colores,
            headerType: 1
        }
        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }

    let { key } = await conn.sendMessage(m.chat, { text: '⏳ *Procesando con la tecnología de Sasuke Bot...*' }, { quoted: m })

    try {
        await m.react('🕒')

        // API configurada para Sasuke Bot
        const apiKey = "yosoyyo_sk_u8qjoidy"
        const colorFondo = color.trim().toLowerCase()
        const textoFormateado = wrapText(textoFinal, 28)

        const apiUrl = `https://yosoyyo-api-ofc.onrender.com/api/brat?text=${encodeURIComponent(textoFormateado)}&color=${colorFondo}&apiKey=${apiKey}`

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })

        const img = `./tmp-${Date.now()}.png`
        const webp = `./tmp-${Date.now()}.webp`
        fs.writeFileSync(img, response.data)

        // Conversión FFmpeg optimizada
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${img} -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ${webp}`, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        // Envío con tus créditos exclusivos
        await conn.sendMessage(m.chat, { 
            sticker: fs.readFileSync(webp), 
            packname: "𝖲𝖺𝗌𝗎𝗄𝖾 𝖡𝗈𝗍 𝖬𝖣 👤", 
            author: "𝖡𝗒 𝖡𝖺𝗋𝖻𝗈𝗓𝖺-𝖳𝖾𝖺𝗆 ⚡" 
        }, { quoted: m })

        await conn.sendMessage(m.chat, { text: '✅ *Sticker generado por Barboza-Team!*', edit: key })
        await m.react('✔️')

        if (fs.existsSync(img)) fs.unlinkSync(img)
        if (fs.existsSync(webp)) fs.unlinkSync(webp)

    } catch (e) {
        console.error(e)
        await m.react('✖️')
        await conn.sendMessage(m.chat, { text: '❌ *Error en Sasuke Bot API.*', edit: key })
    }
}

function wrapText(text, max = 22) {
    let words = text.split(' ')
    let lines = []
    let current = []
    for (let w of words) {
        if ((current.join(' ').length + w.length + 1) > max) {
            lines.push(current.join(' '))
            current = [w]
        } else {
            current.push(w)
        }
    }
    if (current.length) lines.push(current.join(' '))
    return lines.join('\n')
}

handler.help = ['brat']
handler.tags = ['sticker']
handler.command = /^(brat|bratcolor)$/i

export default handler