import fetch from 'node-fetch'
import uploadImage from '../lib/uploadImage.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    
    // CORRECCIÓN: Si el mensaje citado es una respuesta, 
    // intenta obtener la imagen del mensaje original al que se respondió.
    if (m.quoted && m.quoted.msg && m.quoted.msg.contextInfo && m.quoted.msg.contextInfo.quotedMessage) {
        let quotedContext = m.quoted.msg.contextInfo
        let originalQuotedMessage = await conn.getMessage(m.chat, quotedContext.stanzaId)
        if (originalQuotedMessage) {
            q = originalQuotedMessage.message
            // El formato de mensaje de GetMessage es diferente, ajustamos q
            if (q.conversation) { /* es texto, no imagen, no hacemos nada */ }
            else if (q.extendedTextMessage && q.extendedTextMessage.contextInfo && q.extendedTextMessage.contextInfo.quotedMessage) {
                // Si el mensaje citado es otro mensaje citado
                q = q.extendedTextMessage.contextInfo.quotedMessage
            }
        }
    }

    let mime = (q.msg || q).mimetype || ''
    let url

    m.react('🕒')

    try {
        if (/image/.test(mime)) {
            // Caso 1: Imagen detectada (directa o citada)
            let img = await q.download()
            url = await uploadImage(img)
        } else if (text && text.startsWith('http')) {
            // Caso 2: URL de imagen detectada
            url = text
        } else {
            // Caso 3: No se pudo encontrar imagen ni URL
            m.react('✖️')
            throw `Responda a una imagen o ingrese una URL válida. Si ya lo hizo, es posible que la imagen sea muy antigua.`
        }

        let api = `https://api.evogb.org/tools/removebg?method=url&url=${encodeURIComponent(url)}&key=Jotaa.hrzkey`
        let response = await fetch(api)
        
        if (!response.ok) throw new Error('API Error')
        
        let buffer = await response.arrayBuffer()
        m.react('☑️')
        
        await conn.sendMessage(m.chat, { image: Buffer.from(buffer) }, { quoted: m })

    } catch (error) {
        m.react('✖️')
        // Un mensaje de error más específico para ayudar al usuario
        let errorMessage = `Error: ${error.message}`
        if (error.message.includes('API Error')) {
            errorMessage = `⚠️ Ocurrió un problema con el servicio de eliminación de fondo. Inténtalo de nuevo más tarde.`
        }
        throw errorMessage
    }
}

handler.tags = ['tools']
handler.help = ['removebg']
handler.command = ['removebg', 'bg']

export default handler
