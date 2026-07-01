let handler = async (m, { conn, args, usedPrefix, command }) => {
    let isClose = {
        'abrir': 'not_announcement',
        'cerrar': 'announcement',
    }[(args[0] || '')]

    if (isClose === undefined) {
        await conn.reply(m.chat, `⚠️ Elija una opción.\n\n*${usedPrefix + command}* abrir\n*${usedPrefix + command}* cerrar`, m)
        return
    }

    await conn.groupSettingUpdate(m.chat, isClose)

    // Aviso de la acción realizada
    let estado = isClose === 'announcement' ? 'cerrado 🔒' : 'abierto 🔓'
    await conn.reply(m.chat, `📢 Grupo actualmente *${estado}*\nPor: @${m.sender.split('@')[0]}`, m, {
        mentions: [m.sender]
    })
}

handler.help = ['grupo abrir', 'grupo cerrar']
handler.tags = ['gc']
handler.command = ['group', 'grupo'] 
handler.admin = true
handler.botAdmin = true

export default handler