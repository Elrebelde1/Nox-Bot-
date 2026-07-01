let handler = async (m, { conn, command, text }) => {
  if (!text) return m.reply(`🛸 *[ BOX BOT MD ]* 🌌\n\n🚩 Etiqueta a una persona o escribe su nombre.`)

  let porcentaje = Math.floor(Math.random() * 500) + 1
  let cmdUpper = command.toUpperCase()
  let userText = text.toUpperCase()
  let menciones = m.mentionedJid ? { mentions: m.mentionedJid } : {}

  let respuestas = {
    'gay2': `_*${userText}* *ES 🏳️‍🌈* *${porcentaje}%* *GAY*_`,
    'lesbiana': `_*${userText}* *ES 🏳️‍🌈* *${porcentaje}%* *LESBIANA*_`,
    'pajero': `_*${userText}* *ES 😏💦* *${porcentaje}%* *PAJERO*_`,
    'pajera': `_*${userText}* *ES 😏💦* *${porcentaje}%* *PAJERA*_`,
    'puto': `_*${userText}* *ES* *${porcentaje}%* *PUTO, MÁS INFORMACIÓN A SU PRIVADO 🔥🥵 XD*_`,
    'puta': `_*${userText}* *ES* *${porcentaje}%* *PUTA, MÁS INFORMACIÓN A SU PRIVADO 🔥🥵 XD*_`,
    'manco': `_*${userText}* *ES* *${porcentaje}%* *MANCO 💩*_`,
    'manca': `_*${userText}* *ES* *${porcentaje}%* *MANCA 💩*_`,
    'rata': `_*${userText}* *ES* *${porcentaje}%* *RATA 🐁 COME QUESO 🧀*_`,
    'prostituto': `_*${userText}* *ES* *${porcentaje}%* *PROSTITUTO 🫦👅, ¿QUIÉN QUIERE DE SUS SERVICIOS? XD*_`,
    'prostituta': `_*${userText}* *ES* *${porcentaje}%* *PROSTITUTA 🫦👅, ¿QUIÉN QUIERE DE SUS SERVICIOS? XD*_`
  }

  let respuestaFinal = respuestas[command.toLowerCase()]
  if (respuestaFinal) {
    await conn.reply(m.chat, respuestaFinal.trim(), m, menciones)
  }
}

handler.help = ['gay', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituta', 'prostituto'].map((v) => v + " *@user*")
handler.tags = ['fun']
handler.command = /^(gay|lesbiana|pajero|pajera|puto|puta|manco|manca|rata|prostituta|prostituto)$/i

export default handler
