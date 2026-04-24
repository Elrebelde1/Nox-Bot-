const handler = async (m, { conn, text, isROwner, isAdmin, usedPrefix, command }) => {
  if (!(isAdmin || isROwner)) return m.reply('❌ *Solo los admins pueden usar este comando.*')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  let chat = global.db.data.chats[m.chat]
  if (!chat.blockcmds) chat.blockcmds = []

  if (!text) {
    let lista = chat.blockcmds.length > 0 ? chat.blockcmds.map(c => `• *${usedPrefix + c}*`).join('\n') : '_Ninguno_'
    let ayuda = `✨ *𝚄𝙲𝙷𝙸𝙷𝙰 𝙲𝙾𝙽𝚃𝚁𝙾𝙻* ✨\n\n🎬 *𝚄𝚜𝚘:* ${usedPrefix + command} [comando]\n📝 *𝙴𝚓𝚎𝚖𝚙𝚕𝚘:* ${usedPrefix + command} play\n\n🚫 *𝙱𝚕𝚘𝚚𝚞𝚎𝚊𝚍𝚘𝚜:* \n${lista}`
    return m.reply(ayuda)
  }

  let cmd = text.toLowerCase().trim().replace(/^\.+/, '')

  if (chat.blockcmds.includes(cmd)) {
    chat.blockcmds = chat.blockcmds.filter(c => c !== cmd)
    return m.reply(`🔓 El comando *${usedPrefix + cmd}* ha sido desbloqueado.`)
  } else {
    chat.blockcmds.push(cmd)
    return m.reply(`🚫 El comando *${usedPrefix + cmd}* ahora está bloqueado en este grupo.`)
  }
}

// ESTA PARTE HACE QUE FUNCIONE SIN TOCAR EL HANDLER.JS
handler.before = async function(m, { isAdmin, isROwner }) {
  if (!m.text || !m.chat || !global.db.data.chats[m.chat]) return 
  
  let chat = global.db.data.chats[m.chat]
  if (!chat.blockcmds || chat.blockcmds.length === 0) return

  let usedPrefix = (m.text.match(/^[.!#]/) || [''])[0]
  if (!usedPrefix) return
  
  let command = m.text.replace(usedPrefix, '').trim().split(' ')[0].toLowerCase()

  if (chat.blockcmds.includes(command)) {
    if (isAdmin || isROwner) return 
    m.reply(`🚫 El comando *${usedPrefix + command}* está desactivado en este grupo.`)
    return true // Esto detiene la ejecución de cualquier otro plugin
  }
}

handler.help = ['block']
handler.tags = ['group']
handler.command = /^(block|bloquearcmd)$/i
handler.group = true

export default handler
