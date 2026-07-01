let handler = async (m, { conn, args, usedPrefix, command }) => {
    let kickTarget = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    
    if (!kickTarget) return m.reply(`🚩 *Uso correcto:* ${usedPrefix + command} @usuario`)
    
    try {
        await conn.groupParticipantsUpdate(m.chat, [kickTarget], 'remove')
        m.reply(`✅ *Usuario expulsado exitosamente.*`)
    } catch (e) {
        m.reply(`⚠️ *Error:* Asegúrate de que soy administrador y el usuario está en el grupo.`)
    }
}

handler.help = ['kick @usuario']
handler.tags = ['admin']
handler.command = /^kick$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
