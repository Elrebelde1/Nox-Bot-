import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `_*[ ⚠️ ] Ingresa el nombre de la canción o un link de Spotify*_\n\n_Ejemplo:_\n${usedPrefix + command} Lupita`

    try {
        await m.react('⏳')
        const apiKey = '799343a24b120a1a5798fe780b823230'
        
        // 1. Iniciar la solicitud
        const initialRes = await axios.get(`https://optishield.uk/api/`, {
            params: {
                type: 'spotifySearch',
                apikey: apiKey,
                query: text
            }
        })

        let data = initialRes.data
        
        // 2. Si está procesando, entrar en bucle de espera (Polling)
        if (data.status === 'processing') {
            const checkUrl = data.check_result
            let isReady = false
            let attempts = 0

            // Reintentar cada 3 segundos, máximo 10 veces
            while (!isReady && attempts < 10) {
                attempts++
                await new Promise(resolve => setTimeout(resolve, 3000)) 
                
                const checkRes = await axios.get(checkUrl)
                if (checkRes.data.status !== 'processing') {
                    data = checkRes.data
                    isReady = true
                }
            }
        }

        // 3. Validar si obtuvimos resultados finales
        if (!data.result || (Array.isArray(data.result) && data.result.length === 0)) {
            throw 'No se pudo obtener el resultado después de esperar.'
        }

        // Extraer la información (ajustado a la estructura típica de resultados)
        const track = Array.isArray(data.result) ? data.result[0] : data.result
        const { title, name, artists, artist, album, thumbnail, image, download, url } = track

        const info = `
┏━━━━━━ ⚡ 𝙎𝙋𝙊𝙏𝙄𝙙𝙔 ⚡ ━━━━━━┓
┃ 
┃ ⧁ 𝙏𝙄𝙏𝙐𝙇𝙊: ${title || name}
┃ ⧁ 𝘼𝙍𝙏𝙄𝙎𝙏𝘼: ${artists || artist}
┃ ⧁ 𝘼𝙇𝘽𝙐𝙈: ${album || 'Single'}
┃ 
┗━━━━━━━━━━━━━━━━━━━━━━┛
_*🎶 Enviando audio...*_`.trim()

        // Enviar imagen informativa
        await conn.sendFile(m.chat, thumbnail || image || '', 'cover.jpg', info, m)

        // 4. Enviar el Audio
        const audioUrl = download || url
        if (audioUrl) {
            await conn.sendMessage(m.chat, { 
                audio: { url: audioUrl }, 
                fileName: `${title || name}.mp3`, 
                mimetype: 'audio/mpeg'
            }, { quoted: m })
            await m.react('✅')
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply(`❌ *Error:* El servidor está ocupado o la API Key es inválida.`)
    }
}

handler.help = ['spotify']
handler.tags = ['descargas']
handler.command = /^(spoti|spotify|play0)$/i

export default handler
