const fkontakOpen = {
  key: {
    participant: '0@s.whatsapp.net',
    remoteJid: 'status@broadcast',
    fromMe: false,
    id: 'AdminGroupOpen'
  },
  message: {
    contactMessage: {
      displayName: '⚙️ 𝘚𝘺𝘴𝘵𝘦𝘮 𝘈𝘥𝘮𝘪𝘯𝘪𝘴𝘵𝘳𝘢𝘵𝘰𝘳 ⚙️\n🔓 *𝘎𝘳𝘶𝘱𝘰 𝘏𝘢𝘣𝘪𝘭𝘪𝘵𝘢𝘥𝘰 / 𝘈𝘱𝘦𝘳𝘵𝘶𝘳𝘢*',
      vcard: `BEGIN:VCARD\nVERSION:3.0\nN:System;Open;;;\nFN:⚙️ System Admin\nORG:Control Panel\nTEL;type=CELL;waid=1234567890:+1 234 567 890\nEND:VCARD`
    }
  }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  let tiempo = args[0]
  let tipo = args[1]?.toLowerCase()

  if (!tiempo || isNaN(tiempo) || !['segundo', 'minuto', 'hora', 'segundos', 'minutos', 'horas'].includes(tipo)) {
    return conn.reply(
      m.chat, 
      `⚙️ *𝘗𝘢𝘯𝘦𝘭 𝘥𝘦 𝘊𝘰𝘯𝘵𝘳𝘰𝘭* ⚙️\n⚠️ _Sintaxis incorrecta. Use:_\n*${usedPrefix + command} <cantidad> <segundo/minuto/hora>*\n\nEjemplo: *${usedPrefix + command} 10 minutos*`, 
      m
    )
  }

  let milisegundos = parseInt(tiempo)
  if (tipo.startsWith('segundo')) milisegundos *= 1000
  if (tipo.startsWith('minuto')) milisegundos *= 60000
  if (tipo.startsWith('hora')) milisegundos *= 3600000

  await conn.sendMessage(
    m.chat, 
    { text: `⏳ *𝘊𝘳𝘰𝘯𝘰𝘮𝘦𝘵𝘳𝘢𝘫𝘦 𝘈𝘤𝘵𝘪𝘷𝘰* ⏳\n\n⚙️ _Las restricciones de escritura se removerán en_ *${tiempo} ${tipo}*._` }, 
    { quoted: fkontakOpen }
  )

  setTimeout(async () => {
    await conn.groupSettingUpdate(m.chat, 'not_announcement')
    conn.sendMessage(
      m.chat, 
      { text: `🔓 *𝘎𝘳𝘶𝘱𝘰 𝘈𝘣𝘪𝘦𝘳𝘵𝘰* 🔓\n\n⚙️ _El acceso al chat ha sido restablecido por el Administrador. Todos los miembros pueden enviar mensajes._` },
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
