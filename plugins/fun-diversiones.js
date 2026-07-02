let handler = async (m, { conn, command, text }) => {
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] 
          : m.quoted ? m.quoted.sender 
          : m.sender;
  
  let name = await conn.getName(who);
  let userTarget = m.mentionedJid && m.mentionedJid[0] ? `@${who.split('@')[0]}` : name;
  let porcentaje = Math.floor(Math.random() * 500) + 1;

  let respuestas = {
    'gay': `_*${userTarget}* *ES 🏳️‍🌈* *${porcentaje}%* *GAY*_`,
    'lesbiana': `_*${userTarget}* *ES 🏳️‍🌈* *${porcentaje}%* *LESBIANA*_`,
    'pajero': `_*${userTarget}* *ES 😏💦* *${porcentaje}%* *PAJERO*_`,
    'pajera': `_*${userTarget}* *ES 😏💦* *${porcentaje}%* *PAJERA*_`,
    'puto': `_*${userTarget}* *ES* *${porcentaje}%* *PUTO, MÁS INFORMACIÓN A SU PRIVADO 🔥🥵 XD*_`,
    'puta': `_*${userTarget}* *ES* *${porcentaje}%* *PUTA, MÁS INFORMACIÓN A SU PRIVADO 🔥🥵 XD*_`,
    'manco': `_*${userTarget}* *ES* *${porcentaje}%* *MANCO 💩*_`,
    'manca': `_*${userTarget}* *ES* *${porcentaje}%* *MANCA 💩*_`,
    'rata': `_*${userTarget}* *ES* *${porcentaje}%* *RATA 🐁 COME QUESO 🧀*_`,
    'prostituto': `_*${userTarget}* *ES* *${porcentaje}%* *PROSTITUTO 🫦👅, ¿QUIÉN QUIERE DE SUS SERVICIOS? XD*_`,
    'prostituta': `_*${userTarget}* *ES* *${porcentaje}%* *PROSTITUTA 🫦👅, ¿QUIÉN QUIERE DE SUS SERVICIOS? XD*_`
  }

  let respuestaFinal = respuestas[command.toLowerCase()];
  
  if (respuestaFinal) {
    await conn.sendMessage(m.chat, { 
      text: respuestaFinal, 
      mentions: [who] 
    }, { quoted: m });
  }
}

handler.help = ['gay', 'lesbiana', 'pajero', 'pajera', 'puto', 'puta', 'manco', 'manca', 'rata', 'prostituta', 'prostituto'].map((v) => v + " *@user*")
handler.tags = ['fun']
handler.command = /^(gay|lesbiana|pajero|pajera|puto|puta|manco|manca|rata|prostituta|prostituto)$/i

export default handler
