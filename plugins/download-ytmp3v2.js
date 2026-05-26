import axios from 'axios'

// Función auxiliar para obtener el Buffer
async function getBuffer(url) {
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    return Buffer.from(response.data)
}

var handler = async (m, { conn, text, command }) => {
    if (!text) return m.reply(`《✧》 Por favor, ingresa un enlace de YouTube.\n\n*Ejemplo:* _.${command} https://www.youtube.com/watch?v=dQw4w9WgXcQ_`)

    // Reacción de procesamiento
    if (m.react) await m.react("⏳")

    try {
        const apiUrl = `https://api.evogb.org/dl/ytmp3?url=${encodeURIComponent(text)}&key=abcd1234`
        const { data: res } = await axios.get(apiUrl)
        
        if (!res || !res.data || !res.data.dl) {
            if (m.react) await m.react("❌")
            return m.reply('《✧》 No se pudo obtener el enlace de descarga de la API.')
        }

        const audioBuffer = await getBuffer(res.data.dl)

        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg', 
            ptt: false              // false = Envía como canción con reproductor completo
        }, { quoted: m })

        if (m.react) await m.react("✅")

    } catch (error) {
        console.error("Error enviando audio:", error)
        if (m.react) await m.react("❌")
        return m.reply('《✧》 Ocurrió un error al procesar el audio.')
    }
}

handler.help = ['ytmp3v2 <url>']
handler.tags = ['downloader']
handler.command = ['ytmp3v2', 'yta2'] // Comandos asignados

export default handler
