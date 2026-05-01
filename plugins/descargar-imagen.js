/**
 * Code creado por Barboza Developer
 * Se te agradece dejar los créditos.
 * Disfruta el código de Barboza Developer x Zona Developers.
 */

import fetch from "node-fetch"

var handler = async (m, { text, usedPrefix, command }) => {
    if (!text) return m.reply(`*Ingrese su consulta*\n\n*Ejemplo:* ${usedPrefix}${command} ¿Quién es Messi?`)

    await m.react('💬')

    try {
        const res = await fetch(`https://api.delirius.store/ia/chatgpt?q=${encodeURIComponent(text)}`)
        const json = await res.json()

        if (!json.status || !json.data) {
            await m.react('❌')
            return m.reply('⚠️ Error API')
        }

        await m.reply(json.data)
        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply('🛑 Error')
    }
}

handler.help = ['chatgpt']
handler.tags = ['ia']
handler.command = /^(chatgpt2|ia2)$/i

export default handler
