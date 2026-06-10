let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!m.quoted) return m.reply(`🏮 *𝘚𝘢𝘴𝘶𝘬𝘦 𝘜𝘤𝘩𝘪𝘩𝘢 𝘉𝘰𝘵* 🏮\n⚠️ _Responde al sticker que deseas asignar como comando con:_ *${usedPrefix + command} <archivo.js>*`)
  if (!text) return m.reply(`🏮 *𝘚𝘢𝘴𝘶𝘬𝘦 𝘜𝘤𝘩𝘪𝘩𝘢 𝘉𝘰𝘵* 🏮\n⚠️ _Debes ingresar el nombre del archivo._\nEjemplo: *${usedPrefix + command} menu.js*`)
  
  let q = m.quoted
  let mime = (q.msg || q).mimetype || ''
  if (!/webp/.test(mime)) return m.reply('👁️‍🗨️ _El mensaje respondido debe ser estrictamente un sticker._')
  if (!q.fileSha256) return m.reply('⚡ _No se pudo generar el hash identificador del sticker._')

  let comandoFinal = text.trim()
  if (!comandoFinal.endsWith('.js')) {
    comandoFinal += '.js'
  }

  let hash = Buffer.from(q.fileSha256).toString('base64')
  if (!global.db.data.sticker) global.db.data.sticker = {}
  
  global.db.data.sticker[hash] = {
    text: comandoFinal,
    mentionedJid: m.mentionedJid || []
  }

  m.reply(`⛩️ *𝘑𝘶𝘵𝘴𝘶: 𝘊𝘰𝘮𝘢𝘯𝘥𝘰 𝘈𝘴𝘪𝘨𝘯𝘢𝘥𝘰* ⛩️\n\n✅ *𝘚𝘵𝘪𝘤𝘬𝘦𝘳:* \`${hash.substring(0, 10)}...\`\n💬 *𝘊𝘰𝘮𝘢𝘯𝘥𝘰:* \`${comandoFinal}\``)
}

handler.help = ['setcmd <archivo.js>']
handler.tags = ['database']
handler.command = ['setcmd', 'addcmd']
handler.rowner = true

export default handler
