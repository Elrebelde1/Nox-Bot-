let handler = async (m, { conn }) => {
  if (!m.isGroup) return
  let chat = global.db.data.chats[m.chat]
  if (!chat.bienvenida) return

  let txt = `🛸 *[ BOX BOT MD ]* 🌌\n\n`

  if (m.messageStubType === 32) {
    txt += `👋 *Salida Voluntaria:* Un miembro ha decidido abandonar el grupo por su cuenta.\n\n`
    txt += `⚙️ *Box Bot MD • Registro de Grupo* 🌀`
    await conn.sendMessage(m.chat, { text: txt })
  } 
  else if (m.messageStubType === 28) {
    txt += `⛔ *Eliminación:* Un miembro ha sido removido del grupo por un administrador.\n\n`
    txt += `⚙️ *Box Bot MD • Registro de Grupo* 🌀`
    await conn.sendMessage(m.chat, { text: txt })
  } 
  else if (m.messageStubType === 27 || m.messageStubType === 31) {
    txt += `👋 *Nueva Entrada:* ¡Bienvenido al grupo!\n`
    txt += `👤 Disfruta tu estadía y recuerda seguir las reglas internas del chat.\n\n`
    txt += `⚙️ *Box Bot MD • Registro de Grupo* 🌀`
    await conn.sendMessage(m.chat, { text: txt })
  }
}

handler.help = ['welcome']
handler.tags = ['on/off']
handler.command = /^(welcome|bienvenida)$/i

export default handler
