const fkontakClose = {
  key: {
    participant: '0@s.whatsapp.net',
    remoteJid: 'status@broadcast',
    fromMe: false,
    id: 'AdminGroupClose'
  },
  message: {
    contactMessage: {
      displayName: '⚙️ 𝘚𝘺𝘴𝘵𝘦𝘮 𝘈𝘥𝘮𝘪𝘯𝘪𝘴𝘵𝘳𝘢𝘵𝘰𝘳 ⚙️\n🔒 *𝘎𝘳𝘶𝘱𝘰 𝘙𝘦𝘴𝘵𝘳𝘪𝘯𝘨𝘪𝘥𝘰 / 𝘊𝘪𝘦𝘳𝘳𝘦*',
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:System;Close;;;\nFN:⚙️ System Admin\nORG:Control Panel\nTEL;type=CELL;waid=1234567890:+1 234 567 890\nEND:VCARD`
    }
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let tiempo = args[0]
  let tipo = args[1]?.toLowerCase()

  if (!tiempo || isNaN(tiempo) || !['segundo', 'minuto', 'hora', 'segundos', 'minutos', 'horas'].includes(tipo)) {
    return conn.reply(
      m.chat, 
      `⚙️ *𝘗𝘢𝘯𝘦𝘭 𝘥𝘦 𝘊𝘰𝘯𝘵𝘳𝘰𝘭* ⚙️\n⚠️ _Sintaxis incorrecta. Use:_\n*${usedPrefix + command} <cantidad> <segundo/minuto/hora>*\n\nEjemplo: *${usedPrefix + command} 5 minutos*`, 
      m
    )
  }

  let milisegundos = parseInt(tiempo)
  if (tipo.startsWith('segundo')) milisegundos *= 1000
  if (tipo.startsWith('minuto')) milisegundos *= 60000
  if (tipo.startsWith('hora')) milisegundos *= 3600000

  await conn.sendMessage(
    m.chat, 
    { text: `⏳ *𝘊𝘳𝘰𝘯𝘰𝘮𝘦𝘵𝘳𝘢𝘫𝘦 𝘈𝘤𝘵𝘪𝘷𝘰* ⏳\n\n⚙️ _El cierre total del chat se ejecutará en_ *${tiempo} ${tipo}*._` }, 
    { quoted: fkontakClose }
  )

  setTimeout(async () => {
    await conn.groupSettingUpdate(m.chat, 'announcement')
    conn.sendMessage(
      m.chat, 
      { text: `🔒 *𝘎𝘳𝘶𝘱𝘰 𝘊𝘦𝘳𝘳𝘢𝘥𝘰* 🔒\n\n⚙️ _El chat ha sido configurado en modo de moderación. Solo los administradores pueden enviar mensajes._` }, 
      { quoted: fkontakClose }
    )
  }, milisegundos)
}

handler.help = ['groupclose <tiempo> <tipo>']
handler.tags = ['group']
handler.command = ['groupclose', 'grouptimeclose', 'cerrartiempo']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
