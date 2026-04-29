// code creador por barboza 
// Se te agradece que dejes mis créditos gracias disfruta el código

import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*¡Hola!* ¿En qué puedo ayudarte hoy?\n\n*Ejemplo:* ${usedPrefix}${command} ¿Quién es Sasuke Uchiha?`, m)

    await m.react('💬')

    try {
        const { data } = await axios.get(`https://api.delirius.store/ia/copilot?query=${encodeURIComponent(text)}`)

        if (!data.text) throw new Error()

        await conn.reply(m.chat, data.text, m)
        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        await conn.reply(m.chat, `⚠️ Lo siento, no pude obtener una respuesta de Copilot en este momento.`, m)
    }
}

handler.help = ['copilot']
handler.tags = ['ia']
handler.command = ['copilot2', 'microsoft']

export default handler
