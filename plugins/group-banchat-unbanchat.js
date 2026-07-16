let handler = async (m, { conn, isOwner, isAdmin, isROwner, command }) => {
  if (!m.isGroup) return
  let chat = global.db.data.chats[m.chat]
  let type = command.toLowerCase()

  if (!(isAdmin || isOwner || isROwner)) {
    global.dfail('admin', m, conn)
    return
  }

  switch (type) {
    case 'banchat': case 'banearchat':
      if (chat.isBanned) return m.reply(`🛸 *[ NOX BOT MD ]* 🌌\n\n⚠️ *Este chat ya se encuentra baneado.*`)
      chat.isBanned = true
      await conn.reply(m.chat, `🛸 *[ NOX BOT MD ]* 🌌\n\n🚫 *Chat Baneado:* El bot ha sido desactivado en este grupo.\n💬 No responderé a ningún comando hasta que sea desbloqueado.\n\n⚙️ *Box Bot MD • Control de Grupos* 🌀`, m)
      break

    case 'unbanchat': case 'desbanearchat':
      if (!chat.isBanned) return m.reply(`🛸 *[ BOX BOT MD ]* 🌌\n\n⚠️ *Este chat no está baneado.*`)
      chat.isBanned = false
      await conn.reply(m.chat, `🛸 *[ NOX BOT MD ]* 🌌\n\n🌀 *Chat Desbaneado:* El bot vuelve a estar activo en este grupo.\n⚡ Ya pueden utilizar todos los comandos con normalidad.\n\n⚙️ *Box Bot MD • Control de Grupos* 🌀`, m)
      break

    default:
      return
  }
}

handler.help = ['banchat', 'unbanchat']
handler.tags = ['grupos']
handler.command = /^(banchat|banearchat|unbanchat|desbanearchat)$/i

export default handler
