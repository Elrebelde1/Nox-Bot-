import { toAudio } from '../lib/converter.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (m.quoted ? m.quoted : m.msg).mimetype || ''
    
    if (!/video|audio/.test(mime)) throw `✅ Responde al *Video* o *Nota de Voz* que desea convertir a mp3.`
    
    try {
        let media = await q.download?.()
        if (!media) return m.reply('❌ No se pudo descargar el medio.')
        
        let audio = await toAudio(media, 'mp4')
        if (!audio.data) return m.reply('❌ Error al convertir el audio.')
        
        // Agregamos 'ptt: true' para que se envíe como nota de voz reproducible
        // Y aseguramos que el mimetype sea audio/mpeg o audio/ogg; codecs=opus
        await conn.sendMessage(m.chat, { 
            audio: audio.data, 
            mimetype: 'audio/mpeg', 
            ptt: true 
        }, { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('✨ Hubo un error al procesar el audio.')
    }
}

handler.help = ['tomp3']
handler.tags = ['tools']
handler.command = ['tomp3', 'toaudio'] 
handler.register = false

export default handler
