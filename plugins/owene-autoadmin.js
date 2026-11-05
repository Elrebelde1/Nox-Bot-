let handler = async (m, { conn }) => {
    try {
        // Asegura limpiar el JID del bot para evitar errores de formato (JID / LID)
        let botJid = conn.user.jid ? conn.user.jid.replace(/:\d+@/, '@') : conn.decodeJid(conn.user.id)
        
        await conn.groupParticipantsUpdate(m.chat, [botJid], 'promote')
        m.reply('✨ ¡Listo! Me he asignado administrador correctamente.')
    } catch (e) {
        m.reply(`❌ Error al intentar dar admin: ${e.message}`)
    }
}

handler.help = ['autoadmin']
handler.tags = ['owner']
handler.command = ['autoadmin']
handler.owner = true // Cambiado a owner para que tome tu validación del handler

export default handler
