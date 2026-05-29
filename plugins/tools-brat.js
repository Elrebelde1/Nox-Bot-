/**
 * 📂 COMANDO: Uchiha Brat Color Buttons
 * 📝 DESCRIPCIÓN: Creador de stickers Brat con menú interactivo de colores.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * Usen los código porfa para traer más 
 * 🔗 API: https://api.evogb.org
 */

import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'

const handler = async (m, { conn, usedPrefix, command, text }) => {
    let [txt, color] = text.split('|')
    let textoFinal = txt ? txt.trim() : (m.quoted?.text || null)

    if (!textoFinal) {
        let alert = `█║▌│█│║▌║││█║▌│║▌║\n`
        alert += `    ⚠️  UCHIHA SYSTEM WARNING  ⚠️   \n`
        alert += `█║▌│█│║▌║││█║▌│║▌║\n\n`
        alert += `> *Escribe el texto para generar tu sticker estilo Brat.*\n`
        alert += `> *Ejemplo:* ${usedPrefix + command} Sasuke Bot`
        return conn.reply(m.chat, alert, m)
    }

    if (textoFinal.length > 35) {
        return conn.reply(m.chat, `⚠️ *Texto muy largo. Máximo 35 caracteres.*`, m)
    }

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
            text: `┏━━━━━━━━━━━━━━━━━━━━━━━━┓\n┃     ⛩️  UCHIHA BRAT COLOR  ⛩️     ┃\n┗━━━━━━━━━━━━━━━━━━━━━━━━┛\n\n📝 *Texto:* ${textoFinal}\n\n*Selecciona un color de fondo para el sticker:*`,
            footer: "By Barboza-Team ⚡",
            buttons: colores,
            headerType: 1
        }
        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }

    await m.react('🕒')

    const tmpImg = `./tmp-${Date.now()}.png`
    const tmpWebp = `./tmp-${Date.now()}.webp`
    const colorFondo = color.trim().toLowerCase()

    try {
        const b = (s) => Buffer.from(s, 'base64').toString('utf-8')
        const endpoint = b("aHR0cHM6Ly9hcGkuZXZvZ2Iub3JnL3Rvb2xzL2JyYXQ=")
        const access = b("c2FzdWtl")
        
        let requestUrl = `${endpoint}?text=${encodeURIComponent(textoFinal)}&animated=false&fondo=${colorFondo}&key=${access}`

        const response = await axios.get(requestUrl, { responseType: 'arraybuffer' })
        fs.writeFileSync(tmpImg, response.data)

        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${tmpImg} -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ${tmpWebp}`, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        await conn.sendMessage(m.chat, { 
            sticker: fs.readFileSync(tmpWebp), 
            packname: "𝖲𝖺𝗌𝗎倦𝖾 𝖡𝗈̣t 𝖬𝖣 👤", 
            author: "𝖡𝗒 𝖡𝖺𝗋𝖻b𝗼𝘇𝒂-𝖳𝖾𝖺𝗆 ⚡" 
        }, { quoted: m })

        await m.react('🔥')

    } catch (e) {
        await m.react('❌')
    } finally {
        if (fs.existsSync(tmpImg)) fs.unlinkSync(tmpImg)
        if (fs.existsSync(tmpWebp)) fs.unlinkSync(tmpWebp)
    }
}

handler.help = ['brat', 'bratcolor']
handler.tags = ['sticker']
handler.command = /^(brat|bratcolor)$/i

export default handler
