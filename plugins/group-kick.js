let handler = async (m, { conn, participants }) => {
    let target = m.mentionedJid?.[0] || m.quoted?.sender

    if (!target && m.text) {
        let match = m.text.match(/@([0-9]{5,16})/g)
        if (match && match.length > 0) {
            target = match[0].replace('@', '') + '@s.whatsapp.net'
        }
    }

    if (!target) {
        return conn.sendMessage(m.chat, { text: '🌃 Debes mencionar a un usuario o responder a su mensaje.' }, { quoted: m })
    }

    try {
        let groupMetadata = await conn.groupMetadata(m.chat)
        let participantsList = groupMetadata.participants || participants || []
        
        let botNumber = conn.decodeJid(conn.user.id)
        let botParticipant = participantsList.find(p => p.id === botNumber)
        let senderParticipant = participantsList.find(p => p.id === m.sender)

        let isBotAdmin = botParticipant && (botParticipant.admin === 'admin' || botParticipant.admin === 'superadmin')
        let isSenderAdmin = senderParticipant && (senderParticipant.admin === 'admin' || senderParticipant.admin === 'superadmin')
        let isSenderOwner = global.owner?.flat().map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)

        if (!isBotAdmin) {
            return conn.sendMessage(m.chat, { text: '⚠️ ¡Necesito ser Administrador del grupo para poder expulsar usuarios!' }, { quoted: m })
        }

        if (!isSenderAdmin && !isSenderOwner) {
            return conn.sendMessage(m.chat, { text: '⚠️ ¡Solo los administradores pueden usar este comando!' }, { quoted: m })
        }

        let owner = groupMetadata.owner || participantsList.find(p => p.admin === 'superadmin')?.id || `${m.chat.split('-')[0]}@s.whatsapp.net`

        if (target === botNumber) {
            return conn.sendMessage(m.chat, { text: '🤖 No puedo eliminarme a mí mismo.' }, { quoted: m })
        }

        if (target === owner) {
            return conn.sendMessage(m.chat, { text: '🩸 No puedo eliminar al propietario del grupo.' }, { quoted: m })
        }

        if (global.owner?.flat().map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(target)) {
            return conn.sendMessage(m.chat, { text: '🦠 No puedo eliminar al dueño del bot.' }, { quoted: m })
        }

        await conn.groupParticipantsUpdate(m.chat, [target], 'remove')
        await conn.sendMessage(m.chat, { text: '✅ Usuario expulsado correctamente.' }, { quoted: m })
    } catch (err) {
        await conn.sendMessage(m.chat, { text: `🫆 Ocurrió un error: ${err.message}` }, { quoted: m })
    }
}

handler.help = ['kick']
handler.tags = ['grupos']
handler.command = ['kick', 'echar', 'hechar', 'sacar', 'ban']
handler.group = true

export default handler
