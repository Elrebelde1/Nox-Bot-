let handler = async (m, { conn, participants, usedPrefix, command }) => {
    let mentionedJid = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null
    
    if (!mentionedJid) return conn.reply(m.chat, `🌀 Debes mencionar a un usuario o responder a un mensaje para poder expulsarlo.`, m)
    
    try {
        let groupMetadata = await conn.groupMetadata(m.chat)
        let ownerGroup = groupMetadata.owner || m.chat.split`-`[0] + '@s.whatsapp.net'
        let ownerBot = global.owner[0][0] + '@s.whatsapp.net'
        
        if (mentionedJid === conn.user.jid) return conn.reply(m.chat, `🤖 No puedo eliminarme a mí mismo.`, m)
        if (mentionedJid === ownerGroup) return conn.reply(m.chat, `🩸 No puedo eliminar al propietario del grupo.`, m)
        if (mentionedJid === ownerBot) return conn.reply(m.chat, `🦠 No puedo eliminar al dueño del bot.`, m)
        
        await conn.groupParticipantsUpdate(m.chat, [mentionedJid], 'remove')
        conn.reply(m.chat, `✅ *Usuario expulsado correctamente.*`, m)
    } catch (e) {
        conn.reply(m.chat, `🫆 Se ha producido un problema.\n> *Error:* ${e.message}`, m)
    }
}

handler.help = ['kick @user']
handler.tags = ['grupo']
handler.command = ['kick', 'echar', 'hechar', 'sacar', 'ban']
handler.admin = true
handler.group = true
handler.botAdmin = true

export default handler
