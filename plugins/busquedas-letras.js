let handler = async (m, { conn }) => {
    if (!m.isGroup) throw '⚠️ Este comando solo se puede usar en grupos.'
    
    await conn.reply(m.chat, `🌐 *ID DE ESTE GRUPO:*\n\n\`\`\`${m.chat}\`\`\``, m)
}

handler.help = ['id', 'gp-id']
handler.tags = ['group']
handler.command = /^(id|groupid|gpid|idgp)$/i

export default handler
