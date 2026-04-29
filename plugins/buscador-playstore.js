import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*¡Hola!* ¿Qué imagen buscas en Pinterest?\n\n*Ejemplo:* ${usedPrefix}${command} Messi`, m)

    await m.react('🔍')

    try {
        const { data } = await axios.get(`https://api.delirius.store/search/pinterest?text=${encodeURIComponent(text)}`)

        if (!data.status || !data.results || data.results.length === 0) throw new Error()

        const imagen = data.results[Math.floor(Math.random() * data.results.length)]

        await conn.sendMessage(m.chat, { 
            image: { url: imagen }, 
            caption: `*〔 PINTEREST 〕*\n\n*Resultado de:* ${text}` 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        await conn.reply(m.chat, `⚠️ No encontré imágenes.`, m)
    }
}

handler.help = ['pinterest']
handler.tags = ['busquedas']
handler.command = ['pinterest3', 'pin2']

export default handler
