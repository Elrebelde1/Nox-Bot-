let handler = async (m, { conn, isOwner }) => {
  if (m.isGroup) return
  let bot = global.db.data.settings[conn.user.jid] || {}
  
  if (bot.antiPrivate && !isOwner && !m.fromMe) {
    let txt = `🛸 *[ BOX BOT MD ]* 🌌\n\n`
    txt += `⚠️ *Chat Privado Desactivado.*\n`
    txt += `💬 El modo antiprivado está activo. Serás bloqueado automáticamente.\n\n`
    txt += `⚙️ *Box Bot MD • Sistema Automatizado* 🌀`
    
    await conn.reply(m.chat, txt, m)
    await conn.updateBlockStatus(m.sender, 'block')
  }
}

handler.help = ['antiprivado']
handler.tags = ['on/off']
handler.command = /^(antiprivado)$/i

export default handler
