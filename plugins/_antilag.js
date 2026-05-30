const linkRegex = /chat\.whatsapp\.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i
const channelLinkRegex = /whatsapp\.com\/channel\/([0-9A-Za-z]{20,30})/i

// Lista de los 4 grupos permitidos (2 por JID y 2 por código de link)
const gruposPermitidos = [
    '120363406315912646@g.us',
    '120363402347164600@g.us'
]

const linksPermitidos = [
    'HbgvsjtXZT7AtafzrvdHUm',
    'LB5jZthWV8L1OwFs20hFzW'
]

const handler = async (m, { conn, args, isAdmin, isOwner }) => {
    if (!isAdmin && !isOwner) throw "⚠️ Solo los administradores pueden usar este comando."

    let chat = global.db.data.chats[m.chat]
    if (!chat) global.db.data.chats[m.chat] = {}

    if (/on/i.test(args[0])) {
        chat.antiLag = true
        await conn.reply(m.chat, "✅ *Anti-Lag activado para este grupo.*", m)
    } else if (/off/i.test(args[0])) {
        chat.antiLag = false
        await conn.reply(m.chat, "❌ *Anti-Lag desactivado para este grupo.*", m)
    } else {
        await conn.reply(m.chat, "📌 Uso: *.antilag on* / *.antilag off*", m)
    }
}

handler.help = ['antilag <on/off>']
handler.tags = ['group']
handler.command = /^(antilag)$/i

handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    if (!m.isGroup) return 

    // Si el mensaje es el comando para encender/apagar, salimos del before 
    // sin retornar nada (así no bloquea al handler principal)
    if (m.text && /^[./#]antilag/i.test(m.text)) return

    const chat = global.db.data.chats[m.chat]
    if (!chat?.antiLag) return

    // 1. FILTRO DE GRUPOS: El Anti-Lag solo actuará en los 4 grupos configurados
    const esGrupoValido = gruposPermitidos.includes(m.chat)
    const tieneLinkValido = linksPermitidos.some(code => m.text && m.text.includes(code))
    if (!esGrupoValido && !tieneLinkValido) return

    // 2. FILTRO AUTOMÁTICO DE SUBBOTS: Ignora si es sesión secundaria
    if (conn.user.id.includes(':')) return

    const botNumber = conn.user.jid
    if (m.sender === botNumber || m.fromMe || m.isBaileys) return

    const isGroupLink = linkRegex.exec(m.text)
    const isChannelLink = channelLinkRegex.exec(m.text)

    if ((isGroupLink || isChannelLink) && !isAdmin) {
        if (!isBotAdmin) return 

        if (isGroupLink) {
            const groupCode = await conn.groupInviteCode(m.chat).catch(() => null)
            if (groupCode && m.text.includes(groupCode)) return 
        }

        // Ejecución del Anti-Lag
        await conn.sendMessage(m.chat, { delete: m.key })
        await conn.reply(
            m.chat,
            `⚠️ *Anti-Lag Activo (Modo Oficial)*\n\nAdiós *@${m.sender.split('@')[0]}*, enlace detectado. Solo el bot oficial gestiona la seguridad aquí.`,
            m,
            { mentions: [m.sender] }
        )
        return await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    }
}

export default handler
