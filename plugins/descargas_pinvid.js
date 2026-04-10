import axios from 'axios'

let handler = async (m, { conn, text, command }) => {
    if (!text) return m.reply(`¿Qué buscas en Pinterest?\n\nEjemplo: *!${command} Naruto Edit*`)

    await m.react('⏳')

    try {
        // 1. PASO 1: Buscar con Vreden
        const searchRes = await axios.get(`https://api.vreden.my.id/api/v1/search/pinterest?query=${encodeURIComponent(text)}`)
        
        if (!searchRes.data.status || !searchRes.data.result.search_data.length) {
            await m.react('✖️')
            return m.reply('❌ No se encontraron resultados.')
        }

        // Tomamos un link al azar de la búsqueda de Vreden
        const randomLink = searchRes.data.result.search_data[Math.floor(Math.random() * searchRes.data.result.search_data.length)]

        // 2. PASO 2: Extraer info real con Dix Lat (pindl)
        // Usamos el link que nos dio Vreden para obtener el video/imagen real
        const dlRes = await axios.get(`https://api.dix.lat/pindl?url=${randomLink}`)
        
        if (!dlRes.data.success) {
            // Si pindl falla, enviamos directamente lo que nos dio Vreden como imagen
            return await conn.sendMessage(m.chat, { image: { url: randomLink }, caption: `🚀 *Sasuke Bot*\n📌 *Búsqueda:* ${text}` }, { quoted: m })
        }

        const res = dlRes.data.result
        
        // 3. Diseño Sasuke Style
        let doc = `
┏━━━━━━━『 𝐒𝐀𝐒𝐔𝐊𝐄 𝐏𝐈𝐍𝐓𝐄𝐑𝐄𝐒𝐓 』━━━━━━━┓
┃
┃  📌 *TÍTULO:* ${res.title || 'Pinterest Content'}
┃  👤 *AUTOR:* ${res.author || res.author_username || 'Desconocido'}
┃  📦 *TIPO:* ${res.type.toUpperCase()}
┃  📅 *FECHA:* ${res.created_at || 'Reciente'}
┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

🚀 *Contenido de calidad...*`.trim()

        // 4. Envío dinámico (Video o Imagen)
        if (res.type === 'video') {
            await conn.sendMessage(m.chat, { 
                video: { url: res.download }, 
                caption: doc,
                mimetype: 'video/mp4'
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { 
                image: { url: res.download || res.image }, 
                caption: doc
            }, { quoted: m })
        }

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('✖️')
        m.reply('🚀 *Error:* Hubo un problema al conectar las APIs de búsqueda y descarga.')
    }
}

handler.help = ['pinterest', 'pinvid']
handler.tags = ['search', 'dl']
handler.command = ['pinterest', 'pin', 'pinvid', 'pindl'] 

export default handler
