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
        let metadata = await conn.groupMetadata(m.chat)
        let participantsList = metadata.participants || participants || []
        
        let botNumber = conn.decodeJid(conn.user.id)
        let owner = metadata.owner || participantsList.find(p => p.admin === 'superadmin')?.id || `${m.chat.split('-')[0]}@s.whatsapp.net`

        if (target === botNumber) {
            return conn.sendMessage(m.chat, { text: '🤖 No puedo eliminarme a mí mismo.' }, { quoted: m })
        }

        if (target === owner) {
            return conn.sendMessage(m.chat, { text: '🩸 No puedo eliminar al propietario del grupo.' }, { quoted: m })
        }

        if (global.owner) {
            let ownersList = global.owner.flat().map(v => {
                if (typeof v === 'number') v = String(v)
                if (Array.isArray(v)) v = v[0]
                return String(v || '').replace(/[^0-9]/g, '') + '@s.whatsapp.net'
            })
            if (ownersList.includes(target)) {
                return conn.sendMessage(m.chat, { text: '🦠 No puedo eliminar al dueño del bot.' }, { quoted: m })
            }
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
handler.rowner = true

export default handler
