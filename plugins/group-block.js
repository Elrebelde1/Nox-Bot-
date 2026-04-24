const handler = async (m, { conn, text, isROwner, isAdmin, usedPrefix, command }) => {
    // 1. Verificación de seguridad
    if (!(isAdmin || isROwner)) return m.reply('❌ *Solo los admins pueden usar este comando.*')

    // 2. Asegurar que el chat existe en la base de datos
    if (!global.db.data) global.db.data = {}
    if (!global.db.data.chats) global.db.data.chats = {}
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    
    let chat = global.db.data.chats[m.chat]
    if (!chat.blockcmds) chat.blockcmds = [] 

    // 3. SI NO HAY TEXTO (Esto es lo que debería enviarse al poner solo .block)
    if (!text) {
        let txt = `✨ *𝚄𝙲𝙷𝙸𝙷𝙰 𝙲𝙾𝙽𝚃𝚁𝙾𝙻* ✨\n\n`
        txt += `🎬 *𝚄𝚜𝚘:* ${usedPrefix + command} [comando]\n`
        txt += `📝 *𝙴𝚓𝚎𝚖𝚙𝚕𝚘:* ${usedPrefix + command} play\n\n`
        txt += `🚫 *𝙲𝚘𝚖𝚊𝚗𝚍𝚘𝚜 𝚋𝚕𝚘𝚚𝚞𝚎𝚊𝚍𝚘𝚜:* \n`
        txt += chat.blockcmds.length > 0 
            ? chat.blockcmds.map(c => `• ${usedPrefix + c}`).join('\n') 
            : '_Ninguno_'
        
        return m.reply(txt)
    }

    let cmd = text.toLowerCase().replace(usedPrefix, '').trim()

    // 4. Lógica de Bloqueo/Desbloqueo
    if (chat.blockcmds.includes(cmd)) {
        chat.blockcmds = chat.blockcmds.filter(c => c !== cmd)
        if (m.react) await m.react('✅')
        return m.reply(`🔓 El comando *${usedPrefix + cmd}* ha sido desbloqueado.`)
    } else {
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
