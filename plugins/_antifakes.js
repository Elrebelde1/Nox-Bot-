let handler = async (m, { conn }) => {
    // Verifica si el comando se está usando en un grupo
    if (!m.isGroup) return m.reply('⚠️ Este comando solo puede ser utilizado dentro de un grupo.')

    // Envía el ID del grupo actual
    await conn.reply(m.chat, `🆔 *ID de este grupo:* \n\n\`${m.chat}\``, m)
}

handler.help = ['id']
handler.command = /^(id|jid|groupid)$/i

export default handler
