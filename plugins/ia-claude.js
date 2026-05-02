/**
 * 📂 COMANDO: claude
 * 📝 DESCRIPCIÓN: Chat interactivo con la IA Claude.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *¿En qué puedo ayudarte hoy?*\n\n> *Ejemplo:* ${usedPrefix + command} ¿Cómo hacer un bot de WhatsApp?`, m)

    await m.react('🧠')

    try {
        const key64 = 'c2FzdWtl'
        const decodedKey = Buffer.from(key64, 'base64').toString('utf-8')

        const { data } = await axios.get(`https://api.evogb.org/ai/claude?text=${encodeURIComponent(query)}&key=${decodedKey}`)

        if (!data.status) {
            await m.react('❌')
            return m.reply('⚠️ *La IA no pudo responder en este momento.*')
        }

        let response = `┏━━━━━━━━━━━━━━━━┓\n`
        response += `┃   🤖 *CLAUDE AI* ┃\n`
        response += `┗━━━━━━━━━━━━━━━━┛\n\n`
        response += `${data.result}\n\n`
        response += `🔌 *API:* https://api.evogb.org\n`
        response += `⚡ *By: Barboza Developer*`

        await conn.reply(m.chat, response, m)
        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply('⚠️ *Error de conexión con la IA.*')
    }
}

handler.help = ['claude']
handler.tags = ['ai']
handler.command = /^(claude|ai2|clau)$/i

export default handler
