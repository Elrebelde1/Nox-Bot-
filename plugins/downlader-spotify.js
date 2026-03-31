import fetch from 'node-fetch'
import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `_*[ ⚠️ ] Ingresa el nombre de la canción o un link de Spotify*_\n\n_Ejemplo:_\n${usedPrefix + command} Leap of Faith`

    try { 
        const apiKey = 'sylphy-6f150d'
        let trackUrl = text

        // Configuración de Headers para evitar el Error 500
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

        // 1. Lógica de Búsqueda
        if (!/spotify\.com|googleusercontent\.com/.test(text)) {
            const searchRes = await axios.get(`https://sylphy.xyz/search/spotify`, {
                params: { q: text, api_key: apiKey },
                headers: headers
            })

            if (!searchRes.data.status || !searchRes.data.result || searchRes.data.result.length === 0) {
                throw `_*[ ⚠️ ] No se encontraron resultados para: "${text}"*_`
            }
            trackUrl = searchRes.data.result[0].url
        }

        // 2. Lógica de Descarga (Usando Fetch con Headers)
        const downloadRes = await fetch(`https://sylphy.xyz/download/spotify?url=${encodeURIComponent(trackUrl)}&api_key=${apiKey}`, {
            headers: headers
        })
        
        const dlData = await downloadRes.json()

        // Validar si la API respondió con error
        if (!dlData.status || !dlData.result) {
            throw `_*[ ❌ ] La API de descarga devolvió un error (Posible API Key inactiva).*_`
        }

        const res = dlData.result
        const artistas = res.artists.map(v => v.name).join(', ')
        const img = res.album.images[0]?.url || 'https://i.imgur.com/893IDY9.png'

        const info = `
┏━━━━━━ ⚡ 𝙎𝙋𝙊𝙏𝙄𝙁𝙔 ⚡ ━━━━━━┓
┃ 
┃ ⧁ 𝙏𝙄𝙏𝙐𝙇𝙊: ${res.name}
┃ ⧁ 𝘼𝙍𝙏𝙄𝙎𝙏𝘼: ${artistas}
┃ ⧁ 𝘼𝙇𝘽𝙐𝙈: ${res.album.name || 'Single'}
┃ 
┗━━━━━━━━━━━━━━━━━━━━━━┛
_*🎶 Enviando audio...*_`.trim()

        // Enviar Portada
        await conn.sendFile(m.chat, img, 'thumbnail.jpg', info, m)

        // 3. Enviar el Audio MP3
        await conn.sendMessage(m.chat, { 
            audio: { url: res.download_url }, 
            fileName: `${res.name}.mp3`, 
            mimetype: 'audio/mpeg'
        }, { quoted: m })

    } catch (e) {
        console.error('ERROR COMPLETO:', e)
        
        // Si el error es 500, damos un mensaje más claro
        if (e.response?.status === 500) {
            return m.reply(`❌ *Error 500:* El servidor de la API está caído o saturado. Intenta de nuevo en unos minutos.`)
        }
        
        m.reply(`❌ *Ocurrió un error:* ${e.message || e}`)
    }
}

handler.help = ['spotify']
handler.tags = ['descargas']
handler.command = /^(spoti|spotify|play0)$/i

export default handler
