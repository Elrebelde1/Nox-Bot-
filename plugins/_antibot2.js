const handler = async (m, { conn, text }) => {
    // 1. Verificar si el usuario está respondiendo a algo
    if (!m.quoted) return m.reply('✨ *¡Invocación fallida!* Responde al mensaje que quieras reenviar con el comando.')

    // 2. Obtener el ID del chat destino (si no pone nada, es el mismo chat)
    let dest = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.chat
    
    try {
        if (m.react) await m.react('🕊️') // Reacción de "vuelo/envío"

        // 3. Reenviar el mensaje "citado" (quoted)
        // copyNForward lo manda como si fuera un mensaje nuevo del bot
        await conn.copyNForward(dest, m.quoted, true)

        if (text) m.reply(`✅ Mensaje reenviado con éxito a: ${text}`)
        
    } catch (e) {
        console.error(e)
        m.reply('❌ No pude reenviar el mensaje. Asegúrate de que el ID sea correcto o que yo tenga permisos.')
    }
}

handler.help = ['reenviar']
handler.tags = ['tools']
handler.command = /^(reenviar|forward|fwd)$/i

export default handler
