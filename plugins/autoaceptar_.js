let handler = async (m, { conn, args, isAdmin, isOwner }) => {
  if (!isAdmin && !isOwner) throw "⚠️ Solo los admins pueden usar este comando."

  let chat = global.db.data.chats[m.chat]
  if (!args[0]) throw "📌 Usa: .autoaceptar on / off"

  if (args[0] === 'on') {
    chat.autoAceptar = true
    await m.reply("✅ *Filtro de Seguridad Activado*\nSolo se aceptarán números de América y Europa. Números de Asia, África o prefijos sospechosos serán rechazados.")
  } else if (args[0] === 'off') {
    chat.autoAceptar = false
    await m.reply("❌ *Auto-aceptar desactivado*")
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

  const jid = m.sender || m.author
  if (!jid) return !1
  const number = jid.split('@')[0]

  // --- LISTA DE PREFIJOS PERMITIDOS (AMÉRICA Y EUROPA) ---
  const allowed = [
    '58',  // Venezuela 🇻🇪
    '57',  // Colombia 🇨🇴
    '51',  // Perú 🇵🇪
    '54',  // Argentina 🇦🇷
    '56',  // Chile 🇨🇱
    '52',  // México 🇲🇽
    '593', // Ecuador 🇪🇨
    '502', // Guatemala 🇬🇹
    '504', // Honduras 🇭🇳
    '505', // Nicaragua 🇳🇮
    '506', // Costa Rica 🇨🇷
    '507', // Panamá 🇵🇦
    '503', // El Salvador 🇸🇻
    '591', // Bolivia 🇧🇴
    '595', // Paraguay 🇵🇾
    '598', // Uruguay 🇺🇾
    '1',   // USA / Canadá 🇺🇸🇨🇦
    '34',  // España 🇪🇸
    '39',  // Italia 🇮🇹
    '33',  // Francia 🇫🇷
    '44',  // Reino Unido 🇬🇧
    '49',  // Alemania 🇩🇪
    '351'  // Portugal 🇵🇹
  ]

  // --- LÓGICA DE PROCESAMIENTO ---

  // 1. Verificar si el número empieza con alguno de los permitidos
  const isAllowed = allowed.some(prefix => number.startsWith(prefix))

  if (isAllowed) {
    try {
      // Delay de 2 segundos para evitar spam del bot y errores de conexión
      await new Promise(resolve => setTimeout(resolve, 2000))
      await conn.groupRequestParticipantsUpdate(m.chat, [jid], 'accept')
      console.log(`[OK] Aceptado: ${number}`)
    } catch (e) {
      console.error("Error al aceptar:", e)
    }
  } else {
    // 2. Si NO está en la lista permitida, lo rechazamos (Extranjeros/Spam)
    try {
      await conn.groupRequestParticipantsUpdate(m.chat, [jid], 'reject')
      console.log(`[BLOQUEO] Rechazado por prefijo extranjero: ${number}`)
    } catch (e) {
      console.error("Error al rechazar:", e)
    }
  }

  return !0
}

export default handler
