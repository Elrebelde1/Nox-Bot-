const userSpamData = {}

const handler = async (m, { conn, args, isOwner }) => {
  if (!isOwner) return global.dfail('owner', m, conn)
  let bot = global.db.data.settings[conn.user.jid] || {}

  if (/on/i.test(args[0])) {
    bot.antiSpam = true
    await conn.reply(m.chat, "✅ *Anti-Spam activado.*\nLímite: 4 msjs (Aviso) | 6 msjs (Ban)", m)
  } else if (/off/i.test(args[0])) {
    bot.antiSpam = false
    await conn.reply(m.chat, "❌ *Anti-Spam desactivado.*", m)
  } else {
    await conn.reply(m.chat, `📌 Uso: *.antispam on/off*`, m)
  }
}

handler.help = ['antispam on/off']
handler.tags = ['config']
handler.command = /^(antispam)$/i

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, isPrems }) {
  const chat = global.db.data.chats[m.chat]
  const bot = global.db.data.settings[conn.user.jid] || {}
  
  if (!bot.antiSpam || m.fromMe) return
  
  const sender = m.sender
  const currentTime = Date.now()
  const timeWindow = 6000 // Ventana de 6 segundos
  const warnLimit = 4 // Advertencia al 4to
  const kickLimit = 6 // Expulsión al 6to

  // --- RESPUESTA AL CREADOR (SEBASTIÁN) ---
  if (isOwner || isROwner) {
    if (!(sender in userSpamData)) userSpamData[sender] = { lastMessageTime: currentTime, messageCount: 1 }
    const userData = userSpamData[sender]
    if (currentTime - userData.lastMessageTime <= timeWindow) {
      userData.messageCount++
      if (userData.messageCount === warnLimit + 1) {
        await conn.reply(m.chat, `Hey creador, tranquilo... 🌀 No satures el chat.`, m)
      }
    } else {
      userData.messageCount = 1
    }
    userData.lastMessageTime = currentTime
    return 
  }

  // --- FILTRO PARA USUARIOS ---
  if (m.isGroup && (isAdmin || isPrems || !isBotAdmin)) return  
  
  if (!(sender in userSpamData)) {
    userSpamData[sender] = { lastMessageTime: currentTime, messageCount: 1 }
  } else {
    const userData = userSpamData[sender]
    const timeDifference = currentTime - userData.lastMessageTime

    if (timeDifference <= timeWindow) {
      userData.messageCount++
      
      // Al 4to sticker/mensaje tira advertencia
      if (userData.messageCount === warnLimit) {
        await conn.reply(m.chat, `᥀·࣭࣪̇˖⚔️◗ *@${sender.split('@')[0]}*, ¡Deja el spam de stickers! (4/6)`, m, { mentions: [sender] })
      } 
      // Al 6to sticker/mensaje (2 más después del aviso) se va
      else if (userData.messageCount >= kickLimit) {
        await conn.reply(m.chat, `᥀·࣭࣪̇˖👺◗ *@${sender.split('@')[0]}* fue eliminado por ignorar el aviso de spam.`, m, { mentions: [sender] })
        await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
        userData.messageCount = 0 // Reset
      }
    } else {
      userData.messageCount = 1
    }
    userData.lastMessageTime = currentTime
  }
}

export default handler
