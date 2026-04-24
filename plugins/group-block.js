const handler = async (m, { conn, text, isROwner, isAdmin, usedPrefix, command }) => {
    // 1. Verificación de seguridad: Solo admins o el dueño pueden bloquear comandos
    if (!(isAdmin || isROwner)) return m.reply('❌ *Solo los admins pueden usar este comando.*')
    
    // 2. Obtener la base de datos del chat actual
    let chat = global.db.data.chats[m.chat]
    if (!chat.blockcmds) chat.blockcmds = [] // Crear la lista si no existe

    if (!text) return m.reply(`✨ *Uchiha Restricción* ✨\n\n¿Qué comando quieres bloquear o desbloquear?\nEjemplo: *${usedPrefix + command} play*`)

    let cmd = text.toLowerCase().replace(usedPrefix, '').trim()

    // 3. Lógica de Bloqueo/Desbloqueo (Toggle)
    if (chat.blockcmds.includes(cmd)) {
        // Si ya está bloqueado, lo quitamos de la lista (desbloquear)
        chat.blockcmds = chat.blockcmds.filter(c => c !== cmd)
        if (m.react) await m.react('✅')
        return m.reply(`🔓 El comando *${usedPrefix + cmd}* ha sido desbloqueado en este grupo.`)
    } else {
        // Si no está, lo añadimos (bloquear)
        chat.blockcmds.push(cmd)
        if (m.react) await m.react('🚫')
        return m.reply(`🚫 El comando *${usedPrefix + cmd}* ahora está prohibido en este grupo.`)
    }
}

handler.help = ['block [comando]']
handler.tags = ['group']
handler.command = /^(block|bloquearcmd)$/i
handler.group = true // Solo funciona en grupos
handler.admin = true // Solo para admins

export default handler
