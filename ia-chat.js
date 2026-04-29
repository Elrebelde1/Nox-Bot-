import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const input = text || (m.quoted && m.quoted.text)
    
    if (!input) {
        return conn.sendMessage(m.chat, { 
            text: `✨ *SISTEMA IA* ✨\n\nPor favor, escribe una pregunta o petición.\n\n*Ejemplo:* ${usedPrefix}${command} ¿Cómo funciona el código binario?` 
        }, { quoted: m })
    }

    await m.react('🪄')

    try {
        const api = `https://api.delirius.store/ia/chatgpt?q=${encodeURIComponent(input)}`
        const { data: res } = await axios.get(api)

        if (!res.status || !res.data) throw new Error()

        const cleanRes = res.data
            .replace(/Current Conditions/g, "Condiciones:")
            .replace(/Feels Like/g, "Sensación:")
            .replace(/Today's Forecast/g, "Pronóstico:")

        await conn.sendMessage(m.chat, {
            text: cleanRes,
            contextInfo: {
                externalAdReply: {
                    title: 'INTELIGENCIA ARTIFICIAL',
                    body: 'Respuesta procesada con éxito',
                    mediaType: 1,
                    showAdAttribution: true,
                    renderLargerThumbnail: false,
                    thumbnailUrl: 'https://api.delirius.store/favicon.ico',
                    sourceUrl: 'https://api.delirius.store'
                }
            }
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('✖️')
        return conn.reply(m.chat, `⚠️ No se pudo procesar la solicitud.`, m)
    }
}

handler.help = ['sasuke']
handler.tags = ['ia']
handler.command = ['sasuke']

export default handler
