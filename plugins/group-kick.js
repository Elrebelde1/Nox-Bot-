let handler = async (m, { conn, participants, usedPrefix, command }) => {
    let kickTarget = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    
    if (!kickTarget) return m.reply(`🚩 *Uso correcto:* ${usedPrefix + command} @usuario o responde a un mensaje.`)
    if (kickTarget === conn.user.jid) return m.reply(`⚠️ *No puedo expulsarme a mí mismo.*`)
    
    await conn.groupParticipantsUpdate(m.chat, [kickTarget], 'remove')
    m.reply(`✅ *Usuario expulsado exitosamente.*`)
}

handler.help = ['kick @usuario']
handler.tags = ['admin']
handler.command = /^kick$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
