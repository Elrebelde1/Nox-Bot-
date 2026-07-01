let handler = async (m, { conn }) => {
    try {
        await conn.groupParticipantsUpdate(m.chat, [conn.user.jid], 'promote')
        m.reply('Administrador asignado.')
    } catch (e) {
        m.reply('Error: No pude asignarme admin.')
    }
}

handler.help = ['autoadmin']
handler.tags = ['owner']
handler.command = ['autoadmin']
handler.rowner = true

export default handler
