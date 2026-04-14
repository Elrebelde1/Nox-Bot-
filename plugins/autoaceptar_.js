let handler = async (m, { conn, args, isAdmin, isOwner }) => {
  if (!isAdmin && !isOwner) throw "⚠️ Solo los admins pueden usar este comando."

  let chat = global.db.data.chats[m.chat]
  if (!args[0]) throw "📌 Usa: .autoaceptar on / off"

  if (args[0] === 'on') {
    chat.autoAceptar = true
    await m.reply("✅ Auto-aceptar GLOBAL activado (América, Europa y seleccionados).")
  } else if (args[0] === 'off') {
    chat.autoAceptar = false
    await m.reply("❌ Auto-aceptar desactivado.")
  } else {
    await m.reply("📌 Usa: .autoaceptar on / off")
  }
}

handler.help = ['autoaceptar <on/off>']
handler.tags = ['group']
handler.command = /^(autoaceptar)$/i
handler.group = true

handler.before = async function (m, { conn, isBotAdmin }) {
  if (!m.isGroup) return !1

  let chat = global.db.data.chats[m.chat]
  if (!chat?.autoAceptar || !isBotAdmin) return !1

  // Extraemos solo los números del sender (quitamos el @s.whatsapp.net)
  const jid = m.sender || m.author
  const number = jid.split('@')[0]

  // Prefijos permitidos
  const allowed = ['54', '55', '57', '58', '593', '502', '52', '51', '56', '591', '595', '598', '506', '1', '34', '33', '44', '231', '39', '49']
  
  // Prefijos prohibidos
  const forbidden = ['6', '90', '963', '966', '967', '249', '212', '92', '93', '94', '7', '2', '91']

  // 1. Prioridad: Rechazar si está en la lista negra
  if (forbidden.some(prefix => number.startsWith(prefix))) {
    try {
      await conn.groupRequestParticipantsUpdate(m.chat, [jid], 'reject')
      console.log(`[AUTO-RECHAZADO] -> ${number}`)
    } catch (e) {
      console.error("Error al rechazar:", e)
    }
    return !1 
  }

  // 2. Aceptar si está en la lista blanca
  if (allowed.some(prefix => number.startsWith(prefix))) {
    try {
      await conn.groupRequestParticipantsUpdate(m.chat, [jid], 'accept')
      console.log(`[AUTO-ACEPTADO] -> ${number}`)
    } catch (e) {
      console.error("Error al aceptar:", e)
    }
  }

  return !0
}

export default handler
