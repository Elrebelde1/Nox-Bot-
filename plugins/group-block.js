const handler = async (m, { conn, text, isROwner, isAdmin, usedPrefix, command }) => {
    // 1. Verificación de seguridad: Solo admins o el dueño pueden gestionar bloqueos
    if (!(isAdmin || isROwner)) return m.reply('❌ *Solo los admins pueden usar este comando.*')

    // 2. Asegurar que la base de datos para este chat existe
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    let chat = global.db.data.chats[m.chat]
    if (!chat.blockcmds) chat.blockcmds = [] 

    // 3. Menú de ayuda si solo pones el comando (ej: .block)
    if (!text) {
        let lista = chat.blockcmds.length > 0 
            ? chat.blockcmds.map(c => `• *${usedPrefix + c}*`).join('\n') 
            : '_Ninguno_'
            
        let ayuda = `✨ *𝚄𝙲𝙷𝙸𝙷𝙰 𝙲𝙾𝙽𝚃𝚁𝙾𝙻* ✨\n\n`
        ayuda += `🎬 *𝚄𝚜𝚘:* ${usedPrefix + command} [comando]\n`
        ayuda += `📝 *𝙴𝚓𝚎𝚖𝚙𝚕𝚘:* ${usedPrefix + command} play\n\n`
        ayuda += `🚫 *𝙲𝚘𝚖𝚊𝚗𝚍𝚘𝚜 𝚋𝚕𝚘𝚚𝚞𝚎𝚊𝚍𝚘𝚜 𝚊𝚚𝚞𝚒:* \n${lista}`
        
        return m.reply(ayuda)
    }

    // 4. Limpiar el texto: quitar puntos o espacios innecesarios
    let cmd = text.toLowerCase().trim().replace(/^\.+/, '')

    // 5. Lógica de Bloqueo/Desbloqueo (Toggle)
    if (chat.blockcmds.includes(cmd)) {
        // Si ya está en la lista, lo quitamos
        chat.blockcmds = chat.blockcmds.filter(c => c !== cmd)
        if (m.react) await m.react('✅')
        return m.reply(`🔓 El comando *${usedPrefix + cmd}* ha sido desbloqueado.`)
    } else {
        // Si no está, lo añadimos
        chat.blockcmds.push(cmd)
        if (m.react) await m.react('🚫')
        return m.reply(`🚫 El comando *${usedPrefix + cmd}* ahora está bloqueado en este grupo.`)
    }
}

handler.help = ['block']
handler.tags = ['group']
handler.command = /^(block|bloquearcmd)$/i
handler.group = true 
handler.admin = true 

export default handler
