import axios from 'axios'

let handler = async (m, { conn, text, command }) => {
    if (!text) return m.reply(`¿Qué video de Pinterest buscas?\n\nEjemplo: *!${command} Twice Edit*`)

    await m.react('⏳')
    await m.reply('🚀 *Buscando y procesando en Pinterest...*')

    try {
        // 1. PASO 1: Buscar el PIN (Usando tu API de buscadores)
        // Nota: He usado la URL base que parece corresponder a tu estructura de API
        const searchRes = await axios.get(`https://api.dix.lat/api/v1/buscadores/pinterest?apikey=Sasuke&q=${encodeURIComponent(text)}`)
        
        if (!searchRes.data.status || !searchRes.data.data || searchRes.data.data.length === 0) {
            return m.reply('❌ No se encontraron resultados para esa búsqueda.')
        }

        // Tomamos el link del primer resultado de la búsqueda
        const pinLink = searchRes.data.data[0].link

        // 2. PASO 2: Descargar el video (Usando pindl con el link obtenido)
        const dlRes = await axios.get(`https://api.dix.lat/pindl?url=${pinLink}`)
        
        if (!dlRes.data.success) {
            return m.reply('❌ El primer resultado no parece ser un video o no se pudo procesar.')
        }

        const videoData = dlRes.data.result
        const videoUrl = videoData.download
        
        // Verificamos que sea un video
        if (videoData.type !== 'video') {
            return m.reply('⚠️ El resultado encontrado es una imagen. Intenta ser más específico (ej: "edit video").')
        }

        // 3. Diseño del mensaje (Sasuke Style)
        let doc = `
┏━━━━━━━『 𝐒𝐀𝐒𝐔𝐊𝐄 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 』━━━━━━━┓
┃
┃  📌 *TÍTULO:* ${videoData.title || 'Sin título'}
┃  👤 *AUTOR:* ${videoData.author || videoData.author_username}
┃  📋 *TABLERO:* ${videoData.board || 'Varios'}
┃  📅 *FECHA:* ${videoData.created_at || 'Reciente'}
┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🚀 *Enviando contenido de calidad...*
        `.trim()

        // 4. Envío del video
        await conn.sendMessage(m.chat, { 
            video: { url: videoUrl }, 
            caption: doc,
            mimetype: 'video/mp4',
            fileName: `sasuke_pin.mp4`
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        m.reply('🚀 *Error:* No se pudo completar la operación con las APIs de Pinterest.')
        await m.react('✖️')
    }
}

handler.help = ['pinvid']
handler.tags = ['dl', 'search']
handler.command = ['pinvid', 'pinterestvideo', 'pindl'] 

export default handler
