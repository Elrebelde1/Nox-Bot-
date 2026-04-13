const userSpamData = {}

const handler = async (m, { conn, args, isAdmin, isOwner }) => {
  if (!isOwner) return global.dfail('owner', m, conn)
  let bot = global.db.data.settings[conn.user.jid] || {}

  if (/on/i.test(args[0])) {
    bot.antiSpam = true
    await conn.reply(m.chat, "✅ *Anti-Spam activado.* (Límite: 6 stickers/msjs)", m)
  } else if (/off/i.test(args[0])) {
    bot.antiSpam = false
    await conn.reply(m.chat, "❌ *Anti-Spam desactivado.*", m)
  } else {
    await conn.reply(m.chat, `📌 Uso: *.antispam on/off*`, m)
  }
}

handler.help = ['antispam <on/off>']
handler.tags = ['config']
handler.command = /^(antispam)$/i

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isROwner, isPrems }) {
  const chat = global.db.data.chats[m.chat]
  const bot = global.db.data.settings[conn.user.jid] || {}
  
  if (!bot.antiSpam || m.fromMe) return
  
  const sender = m.sender
  const currentTime = new Date().getTime()
  const timeWindow = 5000 // 5 segundos
  const messageLimit = 6 // Límite de 6 para stickers/mensajes

  // --- SECCIÓN ESPECIAL PARA EL CREADOR ---
  if (isOwner || isROwner) {
    if (!(sender in userSpamData)) {
      userSpamData[sender] = { lastMessageTime: currentTime, messageCount: 1 }
    } else {
      const userData = userSpamData[sender]
      if (currentTime - userData.lastMessageTime <= timeWindow) {
        userData.messageCount++
        if (userData.messageCount === messageLimit + 1) { // Solo avisa una vez al pasar el límite
          await conn.reply(m.chat, `Hey creador, tranquilo... 🌀 No satures el chat.`, m)
        }
      } else {
        userData.messageCount = 1
      }
      userData.lastMessageTime = currentTime
    }
    return // No aplica baneos ni avisos de spam al owner
  }

  // --- LÓGICA PARA USUARIOS NORMALES ---
  if (m.isGroup && (chat.modoadmin || isAdmin || isPrems || !isBotAdmin)) return  
  
  let user = global.db.data.users[m.sender]
  let time = 30000 
  let time2 = 60000 
  let time3 = 120000 

  if (!(sender in userSpamData)) {
    userSpamData[sender] = {
      lastMessageTime: currentTime,
      messageCount: 1, 
      antiBan: 0, 
      message: 0,
      message2: 0,
      message3: 0,
    }
  } else {
    const userData = userSpamData[sender]
    const timeDifference = currentTime - userData.lastMessageTime

    if (userData.antiBan === 1 && userData.message < 1) {
      userData.message++  
      await conn.reply(m.chat, `᥀·࣭࣪̇˖⚔️◗ 𝙉𝙤 𝙝𝙖𝙜𝙖𝙨 𝙨𝙥𝙖𝙢 (Máximo 6).`, m, { mentions: [m.sender] })  
    } else if (userData.antiBan === 2 && userData.message2 < 1) {
      userData.message2++  
      await conn.reply(m.chat, `᥀·࣭࣪̇˖⚔️◗ 𝙀𝙨𝙩𝙖𝙨 𝙖𝙫𝙞𝙨𝙖𝙙𝙤(𝙖), 𝙙𝙚𝙩𝙚́𝙣 𝙚𝙡 𝙨𝙥𝙖𝙢.`, m, { mentions: [m.sender] })  
    } else if (userData.antiBan === 3 && userData.message3 < 1) {
      userData.message3++  
      await conn.reply(m.chat, `᥀·࣭࣪̇˖👺◗ 𝙎𝙚𝙧𝙖𝙨 𝙚𝙡𝙞𝙢𝙞𝙣𝙖𝙙𝙤(𝙖) 𝙥𝙤𝙧 𝙛𝙡𝙤𝙤𝙙 𝙙𝙚 𝙨𝙩𝙞𝙘𝙠𝙚𝙧𝙨/𝙢𝙨𝙟𝙨.`, m, { mentions: [m.sender] }) 
      if (m.isGroup && isBotAdmin) await conn.groupParticipantsUpdate(m.chat, [sender], 'remove')
    }

    if (timeDifference <= timeWindow) {
      userData.messageCount += 1
      if (userData.messageCount >= messageLimit) {
        if (userData.antiBan > 2) return
        
        await conn.reply(m.chat, `🚩 _*Mucho Spam*_\n\n𝙐𝙨𝙪𝙖𝙧𝙞𝙤: @${sender.split("@")[0]}`, m, { mentions: [m.sender] })  
        user.banned = true
        userData.antiBan++
        userData.messageCount = 1

        let duration = userData.antiBan === 1 ? time : userData.antiBan === 2 ? time2 : time3
        setTimeout(() => {
          userData.antiBan = 0
          userData.message = 0
          userData.message2 = 0
          userData.message3 = 0
          user.banned = false
        }, duration)
      }
    } else {
      if (timeDifference >= 2000) userData.messageCount = 1
    }
    userData.lastMessageTime = currentTime
  }
}

export default handler
