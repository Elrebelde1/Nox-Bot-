import { proto } from '@whiskeysockets/baileys'

let antidelete = global.db.data.chats

const handler = async (m, { conn, args, isAdmin, isOwner }) => {
  if (!isAdmin && !isOwner) throw "⚠️ Solo los admins pueden usar este comando."

  if (!antidelete[m.chat]) antidelete[m.chat] = {}
  let chat = antidelete[m.chat]

  // Lógica invertida: 'on' ahora pone el estado en false (apaga)
  if (/on/i.test(args[0])) {
    chat.antidelete = false
    await conn.sendMessage(m.chat, { text: "❌ Antidelete desactivado (Estado: ON)." })
  } 
  // Lógica invertida: 'off' ahora pone el estado en true (enciende)
  else if (/off/i.test(args[0])) {
    chat.antidelete = true
    chat.buffer = []
    await conn.sendMessage(m.chat, { text: "✅ Antidelete activado (Estado: OFF)." })
  } else {
    await conn.sendMessage(m.chat, { text: "📌 Usa: .antidelete on / off\n*(Recuerda que funciona al revés)*" })
  }
}

handler.help = ['antidelete <on/off>']
handler.tags = ['group']
handler.command = /^antidelete$/i

handler.before = async (m, { conn }) => {
  let chat = antidelete[m.chat]
  
  // Solo se ejecuta si chat.antidelete es true
  if (!chat?.antidelete) return

  if (m.message && !m.message.protocolMessage) {
    chat.buffer = chat.buffer || []
    chat.buffer.push(JSON.parse(JSON.stringify(m))) // Clonamos para evitar errores de referencia
    if (chat.buffer.length > 20) chat.buffer.shift()
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
          text: `🚫 Mensaje eliminado por @${(deletedKey.participant || deletedKey.remoteJid).split('@')[0]}`, 
          mentions: [deletedKey.participant || deletedKey.remoteJid] 
        }
      )

      await conn.copyNForward(m.chat, msg, false) // Método más estable para reenviar borrados
      
    } catch (e) {
      console.error("Error en antidelete:", e)
    }
  }
}

export default handler
