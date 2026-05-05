const handler = async (m, { conn, text, isOwner, isAdmin }) => {
    // 1. Detectar el mensaje a reenviar (citado o el actual)
    const q = m.quoted ? m.quoted : m
    
    // Si el usuario solo pone el comando sin citar nada
    if (!m.quoted && !text) {
        return m.reply('✨ *Uchiha Reenvío Universal* ✨\n\nResponde a cualquier mensaje (voz, video, foto, sticker o texto) con el comando.')
    }

    try {
        if (m.react) await m.react('🌀')

        // 2. Definir destino (Chat actual o un JID específico)
        let dest = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.chat

        // 3. Lógica de Reenvío Total
        // copyNForward es el método más potente porque mantiene captions y tipos de archivo
        await conn.copyNForward(dest, q, true, { readViewOnce: true }).catch(async (err) => {
            console.error('Fallo copyNForward, intentando relay:', err)
            
            // Si falla, intentamos la retransmisión directa del mensaje original
            return await conn.relayMessage(dest, q.message, { 
                messageId: q.id,
                participant: q.sender 
            })
        })

        if (text) m.reply(`✅ *Contenido enviado a:* ${text}`)

    } catch (e) {
        console.error('Error total en el reenvío:', e)
        m.reply('❌ *Error:* No se pudo replicar el mensaje. Puede que el archivo ya no esté en el servidor o el formato no sea compatible.')
    }
}

handler.help = ['reenviar']
handler.tags = ['tools']
handler.command = /^(reenviar|forward|fwd)$/i
handler.admin = true 

export default handler
