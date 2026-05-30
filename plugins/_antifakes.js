let handler = async (m, { conn, text }) => {
    // Verifica si el comando se está usando en un grupo
    if (!m.isGroup) return m.reply('⚠️ Este comando solo puede ser utilizado dentro de un grupo.')

    // Si no pone nada, da el ID del grupo actual por defecto
    if (!text) {
        return await conn.reply(m.chat, `🆔 *ID de este grupo:* \n\n\`${m.chat}\``, m)
    }

    // Extrae el código de invitación si el usuario pone un link
    let linkRegex = /://whatsapp.com\/([0-9A-Za-z]{20,24})/i
    let [_, code] = text.match(linkRegex) || []

    if (!code) return m.reply('⚠️ El texto ingresado no es un enlace de invitación válido de WhatsApp.')

    try {
        // Obtiene la información del grupo usando el código del enlace
        let res = await conn.groupGetInviteInfo(code)
        
        if (!res || !res.id) return m.reply('❌ No se pudo obtener la información de ese grupo.')

        // Devuelve el ID del grupo del link
        await conn.reply(m.chat, `🆔 *ID del grupo solicitado:* \n\n\`${res.id}\``, m)
    } catch (e) {
        await conn.reply(m.chat, '❌ Hubo un error. Asegúrate de que el enlace sea válido y que el bot no esté baneado de ese grupo.', m)
    }
}

handler.help = ['id <link>']
handler.tags = ['group']
handler.command = /^(id|jid|groupid)$/i

export default handler
