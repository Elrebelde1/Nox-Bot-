/**
 * 📂 COMANDO: Uchiha Brat Sticker Generator
 * 📝 DESCRIPCIÓN: Convierte texto en un sticker estilo Brat (Animado o Estático).
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text || (m.quoted && m.quoted.text ? m.quoted.text : '')

    if (!query) {
        let alert = `💚 BRAT STICKER GENERATOR 💚\n`
        alert += `✧ ────────────────── ✧\n`
        alert += `> *Ingresa el texto que deseas convertir en sticker.*\n`
        alert += `> *Uso:* ${usedPrefix + command} Barboza Developer`
        return conn.reply(m.chat, alert, m)
    }

    await m.react('⏳')

    try {
        const apiTarget = "https://api.evogb.org/tools/brat"
        const access = Buffer.from("c2FzdWtl", 'base64').toString('utf-8')
        
        let isAnimated = 'false'
        if (/animado|gif/i.test(command)) {
            isAnimated = 'true'
        }
        
        const mediaUrl = `${apiTarget}?text=${encodeURIComponent(query)}&animated=${isAnimated}&key=${access}`

        await conn.sendMessage(m.chat, { 
            sticker: { url: mediaUrl },
            isAnimated: isAnimated === 'true'
        }, { quoted: m })

        await m.react('🔥')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('❌ Fallo al generar el sticker en el servidor central.')
    }
}

handler.help = ['brat', 'bratanimado']
handler.tags = ['sticker']
handler.command = /^(brat|bratanimado|bratgif)$/i

export default handler
