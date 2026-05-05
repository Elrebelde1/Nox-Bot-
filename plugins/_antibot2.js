const handler = async (m, { conn, text }) => {
    // 1. Obtener el mensaje citado
    let q = m.quoted ? m.quoted : m
    if (!m.quoted) return m.reply('✨ *Uchiha Reenvío Universal* ✨\n\nResponde a un mensaje para reenviarlo.')

    try {
        if (m.react) await m.react('🌀')

        // 2. Definir destino
        let dest = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.chat

        // 3. Método de reenvío ultra-compatible
        // Usamos generateForwardMessageContent para reconstruir el mensaje
        let message = await conn.copyNForward(dest, q, true, { readViewOnce: true })
        
        // Si por alguna razón devuelve null, forzamos con relayMessage
        if (!message) {
            await conn.relayMessage(dest, q.message, { 
                messageId: q.id, 
                participant: q.sender 
            })
        }

        if (text) m.reply(`✅ *Reenviado a:* ${text}`)

    } catch (e) {
        console.error('Error en reenvío:', e)
        
        // ÚLTIMO RECURSO: Reenvío manual por tipo
        try {
            const type = Object.keys(q.message)[0]
            await conn.sendMessage(text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.chat, { forward: q }, { quoted: m })
        } catch (e2) {
            m.reply('❌ *Error:* El mensaje es incompatible o ya no está disponible en el servidor.')
        }
    }
}

handler.help = ['reenviar']
handler.tags = ['tools']
handler.command = /^(reenviar|forward|fwd)$/i
handler.admin = true 

export default handler
