import axios from 'axios'

let handler = async (m, { conn, text, command }) => {
    // Verificamos que el usuario haya escrito qué buscar
    if (!text) return m.reply(`¿Qué video de Pinterest quieres buscar?\n\nEjemplo:\n*!${command} Twice One Spark*`)

    // Mensaje de espera
    m.reply('🚀 Buscando y procesando el video, espera un momento...')

    try {
        // 1. Petición a la API con el texto del usuario
        const url = `https://api.delirius.store/search/pinterestvideo?query=${encodeURIComponent(text)}`
        const response = await axios.get(url)
        const res = response.data

        // 2. Verificamos si hay resultados
        if (!res.status || !res.data || res.data.length === 0) {
            return m.reply('❌ No encontré ningún video con ese nombre.')
        }

        // 3. Extraemos el primer resultado (el más relevante)
        const videoInfo = res.data[0]
        const videoUrl = videoInfo.video
        const titulo = videoInfo.title

        // 4. Diseño del mensaje estilo Sasuke
        let caption = `
┏━━━━━━━『 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 𝐃𝐋 』━━━━━━━┓
┃
┃  📌 *TÍTULO:* ${titulo}
┃  👤 *AUTOR:* ${videoInfo.author.full_name}
┃  ❤️ *LIKES:* ${videoInfo.likes}
┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
🚀 *Descargado por Sasuke Bot*`.trim()

        // 5. ENVIAR EL VIDEO DIRECTAMENTE
        // Usamos el enlace que viene en 'videoUrl'
        await conn.sendMessage(m.chat, { 
            video: { url: videoUrl }, 
            caption: caption,
            mimetype: 'video/mp4',
            fileName: `${titulo}.mp4`
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('❌ Error al obtener el video. Intenta más tarde.')
    }
}

handler.help = ['pinterestvideo']
handler.tags = ['dl']
handler.command = ['pinterestvideo', 'pinvid', 'pinterestdl'] // Comandos para activar

export default handler
