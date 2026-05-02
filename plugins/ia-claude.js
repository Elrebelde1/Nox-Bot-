/**
 * 📂 COMANDO: claude
 * 📝 DESCRIPCIÓN: Consultas avanzadas con inteligencia artificial.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *¿Qué deseas consultar hoy?*\n\n> *Ejemplo:* ${usedPrefix + command} ¿Qué es la física cuántica?`, m)

    await m.react('🧠')

    try {
        const key64 = 'c2FzdWtl'
        const decodedKey = Buffer.from(key64, 'base64').toString('utf-8')

        const { data } = await axios.get(`https://api.evogb.org/ai/claude?text=${encodeURIComponent(query)}&key=${decodedKey}`)

        if (!data.status) {
            await m.react('❌')
            return m.reply('⚠️ *No se pudo obtener una respuesta.*')
        }

        let response = `┏━━━━━━━━━━━━━━━━┓\n`
        response += `┃   🤖 *CLAUDE AI — INFO* ┃\n`
        response += `┗━━━━━━━━━━━━━━━━┛\n\n`
        response += `💬 *CONSULTA:* ${query}\n\n`
        response += `💡 *RESPUESTA:*\n${data.result}\n\n`
        response += `━━━━━━━━━━━━━━━━━━━━\n`
        response += `🔌 *FUENTE:* https://api.evogb.org\n`
        response += `⚡ *By: Barboza Developer*`

        await conn.reply(m.chat, response, m)
        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply('⚠️ *Error de conexión con el servidor.*')
    }
}

handler.help = ['claude']
handler.tags = ['ai']
handler.command = /^(claude|ai2|clau)$/i

export default handler
