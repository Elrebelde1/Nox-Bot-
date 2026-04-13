const linkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,30})/i

const handler = async (m, { conn, args, isAdmin, isOwner }) => {
    // Validación de permisos para el comando
    if (!isAdmin && !isOwner) throw "⚠️ Solo los administradores pueden usar este comando."

    let chat = global.db.data.chats[m.chat]
    if (!chat) global.db.data.chats[m.chat] = {}

    if (/on/i.test(args[0])) {
        chat.antiLink = true
        await conn.reply(m.chat, "✅ *Anti-Link activado.* Los enlaces externos serán eliminados.", m)
    } else if (/off/i.test(args[0])) {
        chat.antiLink = false
        await conn.reply(m.chat, "❌ *Anti-Link desactivado.*", m)
    } else {
        await conn.reply(m.chat, "📌 Uso: *.antilink on* / *.antilink off*", m)
    }
}

handler.help = ['antilink <on/off>']
handler.tags = ['group']
handler.command = /^(antilink|antilinks)$/i

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    if (!m.isGroup) return !0
    if (m.isBaileys || m.fromMe) return !0

    const chat = global.db.data.chats[m.chat]
    if (!chat?.antiLink) return !0

    const isGroupLink = linkRegex.exec(m.text)
    const isChannelLink = channelLinkRegex.exec(m.text)

    // Si detecta enlace y NO es admin
    if ((isGroupLink || isChannelLink) && !isAdmin) {
        if (!isBotAdmin) {
            await conn.reply(m.chat, `⚠️ *Enlace detectado*, pero necesito ser Admin para eliminar al intruso.`, m)
            return !0
        }

        // Si es un enlace de grupo, verificar si es el de este mismo grupo
        if (isGroupLink) {
            const groupCode = await conn.groupInviteCode(m.chat).catch(() => null)
            if (groupCode && m.text.includes(groupCode)) return !0 // Es el link de casa, no pasa nada
        }

        // Acción: Eliminar mensaje
        await conn.sendMessage(m.chat, { delete: m.key })

        // Acción: Notificar y Expulsar
        await conn.reply(
            m.chat,
            `⚠️ *Enlace prohibido detectado*\n\nAdiós *@${m.sender.split('@')[0]}*, las reglas son claras. 🚫`,
            m,
            { mentions: [m.sender] }
        )

        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    }
    return !0
}

export default handler
