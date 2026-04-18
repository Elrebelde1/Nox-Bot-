import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'

var handler = async (m, { conn, usedPrefix, command, text }) => {
    // Separamos el texto y el color. 
    // Usamos un split más robusto por si el texto tiene espacios
    let [txt, color] = text.split('|')
    let textoFinal = txt ? txt.trim() : (m.quoted?.text || null)

    if (!textoFinal) return conn.reply(m.chat, '⚡ *Escribe el texto para tu sticker brat*\n> Ejemplo: .brat Sasuke Bot', m)

    if (textoFinal.length > 35) {
        return conn.reply(m.chat, `⚠️ *Texto muy largo.*\n\n📌 Máximo: *35 letras*`, m)
    }

    // Si no hay color, mandamos los botones
    if (!color) {
        const colores = [
            { buttonId: `${usedPrefix + command} ${textoFinal}|white`, buttonText: { displayText: "Blanco 🤍" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|green`, buttonText: { displayText: "Verde 💚" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|red`, buttonText: { displayText: "Rojo ❤️" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|blue`, buttonText: { displayText: "Azul 💙" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|yellow`, buttonText: { displayText: "Amarillo 💛" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|pink`, buttonText: { displayText: "Rosa 🩷" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|cyan`, buttonText: { displayText: "Cian 🩵" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|orange`, buttonText: { displayText: "Naranja 🧡" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|purple`, buttonText: { displayText: "Morado 💜" }, type: 1 }
        ]

        const buttonMessage = {
            text: `👤 *𝖲𝖺𝗌𝗎𝗄𝖾 𝖡𝗈𝗍 𝖬𝖣 — 𝖡𝗋𝖺𝗍 𝖢𝗈𝗅𝗈𝗋*\n\n📝 *Texto:* ${textoFinal}\n\n*Elija un color de la lista:*`,
            footer: "𝖡𝗒 𝖡𝖺𝗋𝖻𝗈𝗓𝖺-𝖳𝖾𝖺𝗆 ⚡",
            buttons: colores,
            headerType: 1
        }
        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }

    let { key } = await conn.sendMessage(m.chat, { text: '⏳ *Procesando su sticker...*' }, { quoted: m })

    try {
        const apiKey = "sylphy-6f150d"
        const colorFondo = color.trim().toLowerCase()
        
        // Ajustamos el texto para la imagen (el wrapText solo se aplica aquí)
        let textoFormateado = wrapText(textoFinal, 20)

        // IMPORTANTE: Definir color de letra basado en el fondo para que se vea
        const oscuros = ['black', 'blue', 'red', 'purple', 'morado', 'rojo', 'azul']
        const colorLetra = oscuros.includes(colorFondo) ? 'white' : 'black'

        // Construcción de la URL corregida
        // Cambié "fondo" por el parámetro correcto que espera la API para el color del bloque
        const apiUrl = `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(textoFormateado)}&color=${colorLetra}&fondo=${colorFondo}&api_key=${apiKey}`

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })

        const img = `./tmp-${Date.now()}.png`
        const webp = `./tmp-${Date.now()}.webp`
        fs.writeFileSync(img, response.data)

        // Conversión optimizada para stickers
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${img} -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0,setsar=1" ${webp}`, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        await conn.sendMessage(m.chat, { 
            sticker: fs.readFileSync(webp), 
            packname: "𝖲𝖺𝗌𝗎𝗄𝖾 𝖡𝗈𝗍 𝖬𝖣 👤", 
            author: "𝖡𝗒 𝖡𝖺𝗋𝖻𝗈𝗓𝖺-𝖳𝖾𝖺𝗆 ⚡" 
        }, { quoted: m })

        await conn.sendMessage(m.chat, { text: '✅ *¡Sticker enviado con éxito!*', edit: key })

        if (fs.existsSync(img)) fs.unlinkSync(img)
        if (fs.existsSync(webp)) fs.unlinkSync(webp)

    } catch (e) {
        console.error(e)
        await conn.sendMessage(m.chat, { text: '❌ *Error al generar el sticker.*', edit: key })
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
