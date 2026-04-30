// code creador por barboza 
// Se te agradece que dejes mis créditos gracias disfruta el código

import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'

// Variable para ocultar tu API Key
const apiKey = "sylphy-6f150d"

var handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `⚡ *Escribe el texto para tu sticker brat*\n\n> *Ejemplo:* ${usedPrefix + command} Sasuke Bot | verde`, m)

    let [txt, color] = text.split('|')
    let textoFinal = txt ? txt.trim() : (m.quoted?.text || null)
    let colorFondo = color ? color.trim().toLowerCase() : 'white'

    if (textoFinal.length > 35) {
        return conn.reply(m.chat, `⚠️ *Texto muy largo.*\n\n📌 Máximo: *35 letras*`, m)
    }

    await m.react('🕒')

    try {
        const textoFormateado = wrapText(textoFinal, 28)

        // Usando la variable oculta apiKey
        const apiUrl = `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(textoFormateado)}&color=black&fondo=${colorFondo}&type=Nose&api_key=${apiKey}`

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })

        const img = `./tmp-${Date.now()}.png`
        const webp = `./tmp-${Date.now()}.webp`
        fs.writeFileSync(img, response.data)

        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${img} -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ${webp}`, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        await conn.sendMessage(m.chat, { 
            sticker: fs.readFileSync(webp), 
            packname: "𝖲𝖺𝗌𝗎𝗄𝖾 𝖡𝗈𝗍 𝖬𝖣 👤", 
            author: "𝖡𝗒 𝖡𝖺𝗋𝖻𝗈𝘇𝗮-𝖳𝖾𝖺𝗆 ⚡" 
        }, { quoted: m })

        await m.react('✔️')

        if (fs.existsSync(img)) fs.unlinkSync(img)
        if (fs.existsSync(webp)) fs.unlinkSync(webp)

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('⚠️ Error al generar el sticker.')
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
