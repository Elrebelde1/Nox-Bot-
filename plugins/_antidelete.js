import { proto } from '@whiskeysockets/baileys'

let antidelete = global.db.data.chats

const handler = async (m, { conn, args, isAdmin, isOwner }) => {
  if (!isAdmin && !isOwner) throw "⚠️  Solo los admins pueden usar este comando."

  if (!antidelete[m.chat]) antidelete[m.chat] = {}
  let chat = antidelete[m.chat]

  if (/on/i.test(args[0])) {
    chat.antidelete = true
    chat.buffer = []
    await conn.sendMessage(m.chat, { text: "✅ Antidelete activado en este grupo." })
  } else if (/off/i.test(args[0])) {
    chat.antidelete = false
    await conn.sendMessage(m.chat, { text: "❌ Antidelete desactivado en este grupo." })
  } else {
    await conn.sendMessage(m.chat, { text: "📌 Usa: .antidelete on / off" })
  }
}

handler.help = ['antidelete <on/off>']
handler.tags = ['group']
handler.command = /^antidelete$/i

handler.before = async (m, { conn }) => {
  let chat = antidelete[m.chat]
  if (!chat?.antidelete) return


  if (m.message && !m.message.protocolMessage) {
    chat.buffer = chat.buffer || []
    chat.buffer.push(m)
    if (chat.buffer.length > 10) chat.buffer.shift()
  }

  // Detecta borrado
  if (m.message?.protocolMessage?.type === proto.Message.ProtocolMessage.Type.REVOKE) {
    try {
      const deletedKey = m.message.protocolMessage.key
      const msg = chat.buffer.find(x => x.key?.id === deletedKey.id)
      if (!msg) return

      await conn.sendMessage(
        m.chat,
        { 
          text: `🚫 Mensaje eliminado por @${deletedKey.participant.split('@')[0]}`, 
          mentions: [deletedKey.participant] 
        }
      )

      await conn.sendMessage(m.chat, { 
        forward: { 
          key: msg.key, 
          message: msg.message 
        } 
      })
    } catch (e) {
      console.error("Error en antidelete:", e)
    }
  }
}

export default handler