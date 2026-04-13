const userSpamData = {}

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, isPrems }) {
  const chat = global.db.data.chats[m.chat]
  const bot = global.db.data.settings[conn.user.jid] || {}
  
  if (!bot.antiSpam || m.fromMe) return
  
  const sender = m.sender
  const currentTime = Date.now()
  const timeWindow = 6000 
  const warnLimit = 4 
  const kickLimit = 6 

  // --- FILTRO: SOLO STICKERS O MENSAJES QUE SON PUROS EMOJIS ---
  const isEmojiOnly = /^(?:\p{Emoji_Presentation}|\p{Emoji}\uFE0F|\p{Emoji_Modifier_Base}|\p{Emoji_Modifier}|\p{Emoji_Component})+$/u.test(m.text?.trim())
  const isSticker = m.mtype === 'stickerMessage'
  
  if (!isSticker && !isEmojiOnly) return // Si es texto normal, el código se detiene aquí y no cuenta como spam.

  // --- RESPUESTA AL CREADOR ---
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
      
      if (userData.messageCount === warnLimit) {
        await conn.reply(m.chat, `᥀·࣭࣪̇˖⚔️◗ *@${sender.split('@')[0]}*, ¡Deja el spam de stickers/emojis! (4/6)`, m, { mentions: [sender] })
      } 
      else if (userData.messageCount >= kickLimit) {
        await conn.reply(m.chat, `᥀·࣭࣪̇˖👺◗ *@${sender.split('@')[0]}* fue eliminado por flood de stickers/emojis.`, m, { mentions: [sender] })
        await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
        userData.messageCount = 0 
      }
    } else {
      userData.messageCount = 1
    }
    userData.lastMessageTime = currentTime
  }
}
