const userSpamData = {}

let handler = async (m, { conn, args, isOwner }) => {
  if (!isOwner) return global.dfail('owner', m, conn)
  let bot = global.db.data.settings[conn.user.jid] || {}

  if (/on/i.test(args[0])) {
    bot.antiSpam = true
    await conn.reply(m.chat, "✅ *Anti-Spam activado.*\n_(Solo filtra Stickers y Emojis)_", m)
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
  const timeWindow = 6000 // 6 segundos
  const warnLimit = 4 // Aviso al 4to
  const kickLimit = 6 // Ban al 6to

  // --- DETECCIÓN: SOLO STICKERS O PUROS EMOJIS ---
  const isEmojiOnly = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}|\p{Emoji_Modifier}|\p{Emoji_Component})+$/u.test(m.text?.trim())
  const isSticker = m.mtype === 'stickerMessage'
  
  // Si no es ninguna de las dos, ignoramos el mensaje (permite texto normal)
  if (!isSticker && !isEmojiOnly) return 

  // --- RESPUESTA AL CREADOR (SEBASTIÁN) ---
  if (isOwner || isROwner) {
    if (!(sender in userSpamData)) userSpamData[sender] = { lastMessageTime: currentTime, messageCount: 1 }
    const userData = userSpamData[sender]
    if (currentTime - userData.lastMessageTime <= timeWindow) {
      userData.messageCount++
      if (userData.messageCount === warnLimit + 1) {
        await conn.reply(m.chat, `Hey creador, tranquilo... 🌀 No satures con tanto sticker/emoji.`, m)
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
      
      // Advertencia al 4to sticker/emoji
      if (userData.messageCount === warnLimit) {
        await conn.reply(m.chat, `᥀·࣭࣪̇˖⚔️◗ *@${sender.split('@')[0]}*, ¡Corta el spam de stickers/emojis! (4/6)`, m, { mentions: [sender] })
      } 
      // Expulsión al 6to
      else if (userData.messageCount >= kickLimit) {
        await conn.reply(m.chat, `᥀·࣭࣪̇˖👺◗ *@${sender.split('@')[0]}* fue eliminado por flood de stickers/emojis.`, m, { mentions: [sender] })
        if (m.isGroup) await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
        userData.messageCount = 0 
      }
    } else {
      userData.messageCount = 1
    }
    userData.lastMessageTime = currentTime
  }
}

export default handler
