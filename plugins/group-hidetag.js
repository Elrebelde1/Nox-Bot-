import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, participants, isAdmin }) => {
  if (!isAdmin) return m.reply('🚫 Este comando solo puede usarlo un administrador del grupo.')

  // Obtenemos los JID de los participantes
  let users = participants.map(u => u.id)
  let q = m.quoted ? m.quoted : m

  // Texto final: Si hay texto del usuario lo usa, si no, el del mensaje citado, o el default
  let contenido = text || q.text || '📢 ¡Atención a todos! 👋'

  // Generamos el mensaje con la estructura de Business Verificado estilo Sasuke Bot
  const msg = await generateWAMessageFromContent(m.chat, {
    extendedTextMessage: {
      text: contenido,
      contextInfo: {
        mentionedJid: users,
        isForwarded: true,
        forwardingScore: 999,
        externalAdReply: {
          title: 'WhatsApp Business ✅', // Estilo verificado
          body: '𝙃𝙤𝙡𝙖,𝙎𝙤𝙮 𝙎𝙖𝙨𝙪𝙠𝙚 𝘽𝙤𝙩 𝙈𝘿👾', // El texto que pediste
          thumbnailUrl: 'https://files.catbox.moe/t7uytz.png', // Imagen de Sasuke
          sourceUrl: 'https://github.com/Barboza-Team', 
          mediaType: 1,
          showAdAttribution: true,
          renderLargerThumbnail: false 
        }
      }
    }
  }, { 
    quoted: {
      key: { remoteJid: 'status@broadcast', participant: '0@s.whatsapp.net' },
      message: { 
        conversation: "𝙃𝙤𝙡𝙖,𝙎𝙤𝙮 𝙎𝙖𝙨𝙪𝙠𝙚 𝘽𝙤𝙩 𝙈𝘿👾" // Firma en el quoted
      }
    },
    userJid: conn.user.id 
  })

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.help = ['hidetag']
handler.tags = ['group']
// He añadido 'b' a los comandos para que funcione como pediste antes
handler.command = ['hidetag', 'notify', 'n', 'noti', 'b'] 
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
