import fetch from 'node-fetch'
import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Validar que el usuario ingrese texto
    if (!text) throw `_*[ ⚠️ ] Ingresa el nombre de la canción*_\n\n_Ejemplo:_\n${usedPrefix + command} Leap of Faith`

    try { 
        const apiKey = 'sylphy-6f150d'
        let trackUrl = text

        // 1. Si NO es un link, buscamos la canción primero
        if (!text.includes('googleusercontent.com') && !text.includes('spotify.com')) {
            const searchRes = await axios.get(`https://sylphy.xyz/search/spotify?q=${encodeURIComponent(text)}&api_key=${apiKey}`)
            const searchData = searchRes.data

            if (!searchData.status || !searchData.result || searchData.result.length === 0) {
                throw `_*[ ⚠️ ] No encontré resultados para: "${text}"*_`
            }
            // Según tu JSON de búsqueda, la URL está en result[0].url
            trackUrl = searchData.result[0].url
        }

        // 2. Obtener los datos de descarga
        const downloadRes = await fetch(`https://sylphy.xyz/download/spotify?url=${encodeURIComponent(trackUrl)}&api_key=${apiKey}`)
        const dlData = await downloadRes.json()

        // Validar respuesta de la API de descarga
        if (!dlData.status || !dlData.result) {
            throw `_*[ ❌ ] La API no devolvió datos válidos para este enlace.*_`
        }

        // 3. Extraer datos según tu JSON de "Download"
        const res = dlData.result
        const titulo = res.name
        const linkDescarga = res.download_url
        const portada = res.album.images[0]?.url || 'https://i.imgur.com/893IDY9.png'
        
        // Mapear artistas (es un array de objetos: [{name: 'Lueen'}])
        const artistas = res.artists.map(v => v.name).join(', ')

        const info = `
┏━━━━━━ ⚡ 𝙎𝙋𝙊𝙏𝙄𝙁𝙔 ⚡ ━━━━━━┓
┃ 
┃ ⧁ 𝙏𝙄𝙏𝙐𝙇𝙊
┃ » ${titulo}
┃ 
┃ ⧁ 𝘼𝙍𝙏𝙄𝙎𝙏𝘼
┃ » ${artistas}
┃ 
┃ ⧁ 𝙄𝘿
┃ » ${res.id}
┃ 
┗━━━━━━━━━━━━━━━━━━━━━━┛

_*🎶 Enviando audio, por favor espera...*_`.trim()

        // Enviar la imagen con la información
        await conn.sendFile(m.chat, portada, 'thumbnail.jpg', info, m)

        // 4. Enviar el archivo de audio MP3
        await conn.sendMessage(m.chat, { 
            audio: { url: linkDescarga }, 
            fileName: `${titulo}.mp3`, 
            mimetype: 'audio/mpeg',
            ptt: false 
        }, { quoted: m })

    } catch (e) {
        console.error('Error en Spotify:', e)
        m.reply(`❌ *Ocurrió un error:* ${e.message || e}`)
    }
}

handler.help = ['spotify']
handler.tags = ['descargas']
handler.command = /^(spoti|spotify|play2)$/i

export default handler
