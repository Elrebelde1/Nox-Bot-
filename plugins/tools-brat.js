/**
 * 📂 COMANDO: Uchiha Brat Color Sticker
 * 📝 DESCRIPCIÓN: Creador de stickers estilo Brat con selección de colores.
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
        alert += `> *Escribe el texto y el color separado por una barra (|)*\n`
        alert += `> *Ejemplo:* ${usedPrefix + command} Sasuke Bot | red\n\n`
        alert += `🎨 *Colores soportados:* white, green, red, blue, yellow, pink, cyan, orange, purple`
        return conn.reply(m.chat, alert, m)
    }

    if (textoFinal.length > 35) {
        return conn.reply(m.chat, `⚠️ *Texto muy largo. Máximo 35 caracteres.*`, m)
    }

    await m.react('🕒')

    const tmpImg = `./tmp-${Date.now()}.png`
    const tmpWebp = `./tmp-${Date.now()}.webp`
    const colorFondo = color ? color.trim().toLowerCase() : 'white'

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
            author: "𝖡𝗒 𝖡𝖺𝗋𝖻b𝗼𝘇𝗮-𝖳𝖾𝖺𝗆 ⚡" 
        }, { quoted: m })

        await m.react('🔥')

    } catch (e) {
        await m.react('❌')
    } finally {
        if (fs.existsSync(tmpImg)) fs.unlinkSync(tmpImg)
        if (fs.existsSync(tmpWebp)) fs.unlinkSync(tmpWebp)
    }
}

handler.help = ['bratcolor']
handler.tags = ['sticker']
handler.command = /^(bratcolor|brat)$/i

export default handler
