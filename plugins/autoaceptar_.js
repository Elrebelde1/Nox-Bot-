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

  // Prefijos permitidos (Ampliados con Canadá y los más conocidos)
  const allowed = [
    '54',  // Argentina 🇦🇷
    '55',  // Brasil 🇧🇷
    '57',  // Colombia 🇨🇴
    '58',  // Venezuela 🇻🇪
    '593', // Ecuador 🇪🇨
    '502', // Guatemala 🇬🇹
    '52',  // México 🇲🇽
    '51',  // Perú 🇵🇪
    '56',  // Chile 🇨🇱
    '591', // Bolivia 🇧🇴
    '595', // Paraguay 🇵🇾
    '598', // Uruguay 🇺🇾
    '506', // Costa Rica 🇨🇷
    '1',   // USA y Canadá 🇺🇸🇨🇦
    '34',  // España 🇪🇸
    '33',  // Francia 🇫🇷
    '44',  // Reino Unido 🇬🇧
    '231', // Liberia 🇱🇷
    '39',  // Italia 🇮🇹
    '49'   // Alemania 🇩🇪
  ]
  
  // Prefijos prohibidos (Spam/Bots/Riesgo)
  const forbidden = ['6', '90', '963', '966', '967', '249', '212', '92', '93', '94', '7', '2', '91']

  const sender = m.sender

  // 1. Prioridad: Rechazar si está en la lista negra
  if (forbidden.some(prefix => sender.startsWith(prefix))) {
    try {
      await conn.groupRequestParticipantsUpdate(m.chat, [sender], 'reject')
    } catch (e) {
      console.error("Error al rechazar:", e)
    }
    return !1
  }

  // 2. Aceptar si está en la lista blanca (Latam, Norteamérica, Europa)
  if (allowed.some(prefix => sender.startsWith(prefix))) {
    try {
      await conn.groupRequestParticipantsUpdate(m.chat, [sender], 'accept')
    } catch (e) {
      console.error("Error al aceptar:", e)
    }
  }
  
  return !0
}

export default handler
