const handler = async (m, { conn, command }) => {
  if (!m.mentionedJid[0] && !m.quoted) {
    let texto = `🛸 Menciona o responde al mensaje del usuario que deseas ${command === 'promote' ? 'promover' : 'degradar'} como administrador.`
    return m.reply(texto, m.chat, { mentions: conn.parseMention(texto) })
  }

  let user = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted.sender
  let action = command === 'promote' ? 'promote' : 'demote'
  
  let msgAccion = command === 'promote' 
    ? `🛸 @${user.split('@')[0]} fué promovido como admin\n> Acción realizada por: @${m.sender.split('@')[0]}`
    : `🛸 @${user.split('@')[0]} fué degradado como admin\n> Acción realizada por: @${m.sender.split('@')[0]}`

  await conn.groupParticipantsUpdate(m.chat, [user], action)
  m.reply(msgAccion, m.chat, { mentions: [user, m.sender] })
}

handler.help = ['promote', 'demote']
handler.tags = ['grupos']
handler.command = /^(promote|promover|daradmin|demote|degradar|quitaradmin)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler