let handler = async (m, { conn, isOwner }) => {
  if (m.fromMe || isOwner) return
  let bot = global.db.data.settings[conn.user.jid] || {}
  if (!bot.antiSpam) return

  const isSticker = m.mtype === 'stickerMessage'
  if (!isSticker) return

  this.spam = this.spam ? this.spam : {}
  if (m.sender in this.spam) {
    this.spam[m.sender].count++
    if (this.spam[m.sender].count >= 4) {
      let txt = `🛸 *[ BOX BOT MD ]* 🌌\n\n`
      txt += `⚠️ *Control de Contenido.*\n`
      txt += `⛔ @${m.sender.split('@')[0]} evita la saturación enviando solo stickers.\n\n`
      txt += `⚙️ *Box Bot MD • Filtro de Spam* 🌀`
      
      await conn.sendMessage(m.chat, { delete: m.key })
      await conn.sendMessage(m.chat, { text: txt, mentions: [m.sender] }, { quoted: m })
    }
  } else {
    this.spam[m.sender] = { count: 1, lastSpam: Date.now() }
  }
}

handler.help = ['antispam']
handler.tags = ['on/off']
handler.command = /^(antispam)$/i

export default handler
