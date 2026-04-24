const handler = async (m, { conn, text, isOwner, isAdmin }) => {
    // 1. Verificar si hay un mensaje citado
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    
    if (!m.quoted) return m.reply('✨ *Uchiha Reenvío* ✨\n\nResponde a un mensaje (texto, foto, video, voz) con el comando para volver a enviarlo.')

    try {
        if (m.react) await m.react('🌀') // Reacción de Sharingan

        // 2. Determinar destino (si no hay texto, es el chat actual)
        let dest = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.chat

        // 3. Reenvío Forzado (Ignora restricciones de reenvío)
        await conn.copyNForward(dest, m.quoted, true).catch(async (_) => {
            // Si falla el método normal, usamos el método de retransmisión directa
            return await conn.relayMessage(dest, m.quoted.message, { messageId: m.quoted.id })
        })

        if (text) m.reply(`✅ *Enviado a:* ${text}`)

    } catch (e) {
        console.error(e)
        // Si todo falla, intentamos enviarlo como un mensaje nuevo manual (solo para texto)
        if (m.quoted.text) {
            await conn.sendMessage(m.chat, { text: m.quoted.text }, { quoted: m })
        } else {
            m.reply('❌ *Error crítico:* No se pudo replicar el archivo. Asegúrate de que el mensaje original no haya sido eliminado.')
        }
    }
}

handler.help = ['reenviar']
handler.tags = ['tools']
handler.command = /^(reenviar|forward|fwd)$/i
handler.admin = true // Solo para admins como tú
handler.owner = true // Solo el dueño o admins

export default handler
