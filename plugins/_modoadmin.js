const handler = async (m, { conn, args, isAdmin, isOwner }) => {
    // Validación de permisos para el comando
    if (!isAdmin && !isOwner) throw "⚠️ Solo los administradores pueden usar este comando."

    let chat = global.db.data.chats[m.chat]
    if (!chat) global.db.data.chats[m.chat] = {}

    if (/on/i.test(args[0])) {
        chat.modoadmin = true
        await conn.reply(m.chat, "✅ *Modo Administrador activado.*\nAhora solo los admins pueden usar el bot en este grupo.", m)
    } else if (/off/i.test(args[0])) {
        chat.modoadmin = false
        await conn.reply(m.chat, "❌ *Modo Administrador desactivado.*", m)
    } else {
        await conn.reply(m.chat, "📌 Uso: *.modoadmin on* / *.modoadmin off*", m)
    }
}

handler.help = ['modoadmin <on/off>']
handler.tags = ['config']
handler.command = /^(modoadmin|adminmode)$/i

handler.before = async function (m, { conn, isAdmin, isOwner, isROwner, isPrems }) {
    if (m.isBaileys || m.fromMe) return !0

    let chat = global.db.data.chats[m.chat]
    if (!chat) return !0

    // Si estamos en un grupo
    if (m.isGroup) {
        // Si el modo admin está activo y el que escribe NO es admin/owner/premium
        if (chat.modoadmin && !isAdmin && !isOwner && !isROwner && !isPrems) {
            // Si el usuario intenta usar un comando (empieza con prefijo), ignoramos
            if (m.text.startsWith('.') || m.text.startsWith('/') || m.text.startsWith('#')) {
                return false // Detiene la ejecución de otros plugins
            }
        }
    } else {
        // Lógica para chats privados (opcional, según tu código anterior)
        // Solo permite el uso a dueños o usuarios premium si así lo deseas
        if (!isOwner && !isROwner && !isPrems) {
            // return false // Descomenta esto si quieres bloquear el bot en privados para usuarios normales
        }
    }

    return !0
}

export default handler