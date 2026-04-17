// codigo creado y modificado por Jotaa.hrz 
// no quites creditos bebe
import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'
import baileys from "@whiskeysockets/baileys"
const { proto } = baileys

export async function before(m, { conn }) {
    if (m.message?.buttonsResponseMessage) {
        let selected = m.message.buttonsResponseMessage.selectedButtonId
        let key = m.message.buttonsResponseMessage.contextInfo?.stanzaId || m.key.id

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

    if (!textoFinal) return conn.reply(m.chat, '📤 *Debes escribir algo seguido del comando*\n> ejemplo: .brat me gustan las tetas🍒', m)

    // --- VALIDACIÓN DE LONGITUD ---
    if (textoFinal.length > 35) {
        return conn.reply(m.chat, `⚠️ *El texto es demasiado largo.*\n\n📌Máximo permitido: *35 caracteres*\n❌Tu texto tiene: *${textoFinal.length}* caracteres.`, m)
    }

    textoFinal = wrapText(textoFinal.trim(), 28)

    if (!color) {
        const colores = [
            { buttonId: `${usedPrefix + command} ${textoFinal}|blanco`, buttonText: { displayText: "Blanco🤍" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|verde`, buttonText: { displayText: "Verde💚" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|rojo`, buttonText: { displayText: "Rojo❤️" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|azul`, buttonText: { displayText: "Azul💙" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|amarillo`, buttonText: { displayText: "Amarillo💛" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|rosa`, buttonText: { displayText: "Rosa🩷" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|cian`, buttonText: { displayText: "Cian💚" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|naranja`, buttonText: { displayText: "Naranja🧡" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|morado`, buttonText: { displayText: "Morado💜" }, type: 1 }
        ]

        const buttonMessage = {
            text: `🏳️ 𝙀𝙡𝙞𝙜𝙚 𝙪𝙣 𝙘𝙤𝙡𝙤𝙧 𝙥𝙖𝙧𝙖 𝙩𝙪 𝙨𝙩𝙞𝙘𝙠𝙚𝙧\n\nTexto:\n> "${textoFinal}"\n\n> use .brat2 para el sticker tradicional.`,
            footer: "⏤͟͟͞͞𝙋𝙖𝙣𝙙𝙖 𝘾𝙤𝙢𝙢𝙪𝙣𝙞𝙩𝙮 🐼⚡︎彡",
            buttons: colores,
            headerType: 1
        }

        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }

    try {
        await m.react('🕒')

        const apiKey = "yosoyyo_sk_u8qjoidy"
        const apiUrl = `https://yosoyyo-api-ofc.onrender.com/api/brat?text=${encodeURIComponent(textoFinal)}&color=${color.trim().toLowerCase()}&apiKey=${apiKey}`

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })

        let user = globalThis.db.data.users[m.sender] || {}
        let name = user.name || m.sender.split('@')[0]
        let pack = user.metadatos || `⏤͟͟͞͞𝙋𝙖𝙣𝙙𝙖 𝘾𝙤𝙢𝙢𝙪𝙣𝙞𝙩𝙮 🐼⚡︎彡`
        let auth = user.metadatos2 || `@${name}`

        const img = `./tmp-${Date.now()}.png`
        const webp = `./tmp-${Date.now()}.webp`

        fs.writeFileSync(img, response.data)

        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${img} -vcodec libwebp -filter:v "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ${webp}`, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        await conn.sendMessage(m.chat, { 
            sticker: fs.readFileSync(webp), 
            packname: pack, 
            author: auth 
        }, { quoted: m })

        fs.unlinkSync(img)
        fs.unlinkSync(webp)
        await m.react('✔️')

    } catch (e) {
        await m.react('✖️')
        console.error(e)
    }
}

handler.help = ['brat']
handler.tags = ['sticker']
handler.command = /^(brat|bratcolor)$/i

export default handler