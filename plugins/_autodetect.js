let handler = async (m, { conn }) => {
  if (!m.isGroup) return
  let chat = global.db.data.chats[m.chat]
  if (!chat.detect) return

  let txt = `🛸 *[ BOX BOT MD ]* 🌌\n\n`
  txt += `⚙️ *Aviso del Grupo:* Se han detectado cambios estructurales en los ajustes de este chat.\n\n`
  txt += `⚙️ *Box Bot MD • Monitoreo Activo* 🌀`

  if (m.messageStubType === 21) {
    await conn.sendMessage(m.chat, { text: txt + `\n📝 *Cambio de nombre:* ${m.messageStubParameters[0]}` })
  }
}

handler.help = ['autodetec']
handler.tags = ['on/off']
handler.command = /^(autodetec)$/i

export default handler
