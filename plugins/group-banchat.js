let handler = async (m, { conn, isAdmin, isROwner }) => {
    if (!(isAdmin || isROwner)) return dfail('admin', m, conn)
    
    // Cambiar estado a baneado
    global.db.data.chats[m.chat].isBanned = true
    
    let txt = `✨ *𝐄𝐒𝐓𝐀𝐃𝐎: 𝐃𝐄𝐒𝐀𝐂𝐓𝐈𝐕𝐀𝐃𝐎* ✨\n\n`
    txt += `*❒ Bot:* Sasuke Bot\n`
    txt += `*❒ Acción:* Chat Restringido\n`
    txt += `*❒ Nota:* El bot ya no responderá en este grupo hasta que un administrador use el comando de activación.\n\n`
    txt += `> 🥷 _Sesión finalizada en este sector._`

    await conn.reply(m.chat, txt, m, {
        contextInfo: {
            externalAdReply: {
                title: 'Sᴀsᴜᴋᴇ Bᴏᴛ ─ Sʏsᴛᴇᴍ',
                body: 'Configuración de Grupo',
                sourceUrl: 'https://github.com/', // Puedes poner tu link
                thumbnail: rcanal // Asegúrate de que rcanal esté definido globalmente
            }
        }
    })
    
    await m.react('🔒')
}

handler.help = ['banearbot']
handler.tags = ['group']
handler.command = ['banearbot', 'banchat']
handler.group = true 

export default handler
