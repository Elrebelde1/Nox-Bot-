import fetch from "node-fetch"

const handler = async (m, { text, usedPrefix, command }) => {
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

handler.command = ['chatgpt2', 'ia2']

export default handler
