/**
 * 📂 COMANDO: claude
 * 📝 DESCRIPCIÓN: Consultas con IA Claude.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *Escribe tu consulta*\n\n> *Ejemplo:* ${usedPrefix + command} ¿Quién es Messi?`, m)

    await m.react('🧠')

    try {
        const _0x4a1b = 'ZWt1c2Fz' 
        const key = Buffer.from(_0x4a1b, 'base64').toString('utf-8').split('').reverse().join('')

        const { data } = await axios.get(`https://api.evogb.org/ai/claude?text=${encodeURIComponent(query)}&key=${key}`)

        if (!data.status) {
            await m.react('❌')
            return m.reply('⚠️ *Sin respuesta del servidor.*')
        }

        let response = `┏━━━━━━━━━━━━━━━━┓\n`
        response += `┃   🤖 *CLAUDE AI* ┃\n`
        response += `┗━━━━━━━━━━━━━━━━┛\n\n`
        response += `💡 *RESPUESTA:*\n${data.result}\n\n`
        response += `━━━━━━━━━━━━━━━━━━━━\n`
        response += `⚡ *By: Barboza Developer*\n`
        response += `🌐 *Zona Developers*`

        await conn.reply(m.chat, response, m)
        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply('⚠️ *Error de conexión.*')
    }
}

handler.help = ['claude']
handler.tags = ['ai']
handler.command = /^(claude|ai2|clau)$/i

export default handler
