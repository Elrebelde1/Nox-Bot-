const fkontakOpen = {
  key: {
    participant: '0@s.whatsapp.net',
    remoteJid: 'status@broadcast',
    fromMe: false,
    id: 'SasukeChidoriOpen'
  },
  message: {
    contactMessage: {
      displayName: '⚡ 𝘚𝘢𝘴𝘶𝘬𝘦 𝘜𝘤𝘩𝘪𝘩𝘢 ⚡\n🔓 *𝘑𝘶𝘵𝘴𝘶 𝘥𝘦 𝘈𝘱𝘦𝘳𝘵𝘶𝘳𝘢 𝘛𝘦𝘮𝘱𝘰𝘳𝘢𝘭*',
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sasuke;Open;;;\nFN:⚡ Sasuke Open\nORG:Clan Uchiha\nTEL;type;waid=1234567890:+1 234 567 890\nEND:VCARD`
    }
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.isGroup) return
  if (!(m.isAdmin || m.isOwner)) return global.dfail('admin', m, conn)

  let tiempo = args[0]
  let tipo = args[1]?.toLowerCase()

  if (!tiempo || isNaN(tiempo) || !['segundo', 'minuto', 'hora', 'segundos', 'minutos', 'horas'].includes(tipo)) {
    return conn.reply(
      m.chat, 
      `🏮 *𝘚𝘢𝘴𝘶𝘬𝘦 𝘜𝘤𝘩𝘪𝘩𝘢 𝘉𝘰𝘵* 🏮\n⚠️ _Uso correcto del Jutsu Apertura:_\n*${usedPrefix + command} <cantidad> <segundo/minuto/hora>*\n\nExample: *${usedPrefix + command} 10 minutos*`, 
      m
    )
  }

  let milisegundos = parseInt(tiempo)
  if (tipo.startsWith('segundo')) milisegundos *= 1000
  if (tipo.startsWith('minuto')) milisegundos *= 60000
  if (tipo.startsWith('hora')) milisegundos *= 3600000

  await conn.sendMessage(
    m.chat, 
    { text: `👁️‍🗨️ *𝘑𝘶𝘵𝘴𝘶: 𝘛𝘪𝘦𝘮𝘱𝘰 𝘥𝘦 𝘈𝘱𝘦𝘳𝘵𝘶𝘳𝘢* 👁️‍🗨️\n\n⚡ _El candado del clan se romperá automáticamente en_ *${tiempo} ${tipo}*._` }, 
    { quoted: fkontakOpen }
  )

  setTimeout(async () => {
    await conn.groupSettingUpdate(m.chat, 'not_announcement')
    conn.sendMessage(
      m.chat, 
      { text: `⛩️ *𝘊𝘭𝘢𝘯 𝘈𝘣𝘪𝘦𝘳𝘵𝘰* ⛩️\n\n🏮 _Las puertas del grupo han sido abiertas por orden de Sasuke Uchiha. Los miembros ya pueden hablar._` },
      { quoted: fkontakOpen }
    )
  }, milisegundos)
}

handler.help = ['groupopen <tiempo> <tipo>']
handler.tags = ['group']
handler.command = ['groupopen', 'grouptimeopen', 'abrirtiempo']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
