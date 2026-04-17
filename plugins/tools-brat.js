import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'
import baileys from "@whiskeysockets/baileys"
const { proto } = baileys

export async function before(m, { conn }) {
    if (m.message?.buttonsResponseMessage) {
        let selected = m.message.buttonsResponseMessage.selectedButtonId
        if (selected) {
            m.text = selected
            return conn.executeCommand(selected, m)
        }
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

var handler = async (m, { conn, usedPrefix, command, text }) => {
    let [txt, color] = text.split('|')
    let textoFinal = txt || m.quoted?.text || text

    if (!textoFinal) return conn.reply(m.chat, '⚡ *Escribe el texto para tu sticker brat*\n> Ejemplo: .brat Sasuke Bot', m)

    if (textoFinal.length > 35) {
        return conn.reply(m.chat, `⚠️ *Texto muy largo.*\n\n📌 Máximo: *35 letras*`, m)
    }

    textoFinal = wrapText(textoFinal.trim(), 28)

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
            text: `👤 *𝖲𝖺𝗌𝗎𝗄𝖾 𝖡𝗈𝗍 𝖬𝖣 — 𝖡𝗋𝖺𝗍 𝖢𝗈𝗅𝗈𝗋*\n\n📝 *Texto:* ${textoFinal}\n\n*Elija un color de la lista:*`,
            footer: "𝖢𝗋𝖾𝖽𝗂𝗍𝗌: 𝖩𝗈𝗍𝖺𝖺.𝗁𝗋𝗓 | 𝖡𝗒 𝖡𝖺𝗋𝖻𝗈𝗓𝖺-𝖳𝖾𝖺𝗆 ⚡",
            buttons: colores,
            headerType: 1
        }

        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }

    // --- SISTEMA DE LOADING ---
    let { key } = await conn.sendMessage(m.chat, { text: '⏳ *Procesando su sticker...*' }, { quoted: m })
    
    try {
        await conn.sendMessage(m.chat, { text: '🪄 *Aplicando estilo Brat...*', edit: key })

        const apiKey = "sylphy-6f150d"
        const colorFondo = color.trim().toLowerCase()
        const colorLetra = (colorFondo === 'negro' || colorFondo === 'azul' || colorFondo === 'rojo' || colorFondo === 'morado') ? 'Blanco' : 'Negro'
        
        const apiUrl = `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(textoFinal)}&color=${colorLetra}&fondo=${colorFondo}&type=José&api_key=${apiKey}`

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })

        let pack = "𝖲𝖺𝗌𝗎𝗄𝖾 𝖡𝗈𝗍 𝖬𝖣 👤"
        let auth = "𝖡𝗒 𝖡𝖺𝗋𝖻𝗈𝗓𝖺-𝖳𝖾𝖺𝗆 ⚡"

        const img = `./tmp-${Date.now()}.png`
        const webp = `./tmp-${Date.now()}.webp`

        fs.writeFileSync(img, response.data)

        // Conversión optimizada
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${img} -vcodec libwebp -filter:v "scale=512:512:force_original_aspect_ratio=increase,fps=fps=20" ${webp}`, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        await conn.sendMessage(m.chat, { text: '✅ *¡Listo! Enviando...*', edit: key })

        await conn.sendMessage(m.chat, { 
            sticker: fs.readFileSync(webp), 
            packname: pack, 
            author: auth 
        }, { quoted: m })

        // Borrar mensaje de loading y archivos temporales
        await conn.sendMessage(m.chat, { delete: key })
        fs.unlinkSync(img)
        fs.unlinkSync(webp)

    } catch (e) {
        await conn.sendMessage(m.chat, { text: '❌ *Ocurrió un error al generar el sticker.*', edit: key })
        console.error(e)
    }
}

handler.help = ['brat']
handler.tags = ['sticker']
handler.command = /^(brat|bratcolor)$/i

export default handler
