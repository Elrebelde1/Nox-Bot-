import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*¡Hola!* ¿Qué imágenes buscas en Pinterest?\n\n*Ejemplo:* ${usedPrefix}${command} Messi`, m)

    await m.react('🔍')

    try {
        const { data } = await axios.get(`https://api.delirius.store/search/pinterest?text=${encodeURIComponent(text)}`)

        if (!data.status || !data.results || data.results.length === 0) throw new Error()

        // Selecciona las primeras 5 imágenes de los resultados
        const imagenes = data.results.slice(0, 5)

        for (const url of imagenes) {
            await conn.sendMessage(m.chat, { image: { url: url } }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        await conn.reply(m.chat, `⚠️ No logré enviar las imágenes.`, m)
    }
}

handler.help = ['pinterest']
handler.tags = ['busquedas']
handler.command = ['pinterest3', 'pin4']

export default handler
