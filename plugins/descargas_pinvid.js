import axios from 'axios'

let handler = async (m, { conn, text, command }) => {
    // Validamos que el usuario ingrese una búsqueda
    if (!text) return m.reply(`¿Qué video de Pinterest buscas?\n\nEjemplo: *!${command} Twice Edit*`)

    // Mensaje de carga con estilo
    await m.reply('🚀 *Procesando búsqueda en Pinterest...*')

    try {
        // 1. Petición a la API de Videos (Delirius)
        const response = await axios.get(`https://api.delirius.store/search/pinterestvideo?query=${encodeURIComponent(text)}`)
        const res = response.data

        if (!res.status || !res.data || res.data.length === 0) {
            return m.reply('❌ No se encontraron videos para esa búsqueda.')
        }

        // 2. Seleccionamos el primer resultado
        const videoData = res.data[0]
        const videoUrl = videoData.video
        const titulo = videoData.title || 'Pinterest Video'

        // 3. Diseño del mensaje (Sasuke Style)
        let doc = `
┏━━━━━━━『 𝐒𝐀𝐒𝐔𝐊𝐄 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 』━━━━━━━┓
┃
┃  📌 *TÍTULO:* ${titulo}
┃  👤 *AUTOR:* ${videoData.author.full_name}
┃  ❤️ *LIKES:* ${videoData.likes.toLocaleString()}
┃  📅 *FECHA:* ${videoData.created_at}
┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🚀 *Enviando contenido de calidad...*
        `.trim()

        // 4. Envío del video con el caption personalizado
        await conn.sendMessage(m.chat, { 
            video: { url: videoUrl }, 
            caption: doc,
            mimetype: 'video/mp4',
            fileName: `sasuke_pin.mp4`
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('🚀 *Error:* No se pudo conectar con el servidor de Pinterest.')
    }
}

handler.help = ['pinvid']
handler.tags = ['dl', 'search']
handler.command = ['pinvid', 'pinterestvideo', 'pindl'] 

export default handler
