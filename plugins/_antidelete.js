
import fetch from 'node-fetch'

const handler = async (m, { conn, args, isAdmin, isOwner }) => {
  // Validación de permisos
  if (!isAdmin && !isOwner) throw "⚠️ Solo los administradores pueden usar este comando."

  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = {}

  if (/on/i.test(args[0])) {
    chat.detect = true
    await conn.sendMessage(m.chat, { text: "✅ Modo detección activado.\nEl bot notificará cambios en el grupo." })
  } else if (/off/i.test(args[0])) {
    chat.detect = false
    await conn.sendMessage(m.chat, { text: "❌ Modo detección desactivado." })
  } else {
    await conn.sendMessage(m.chat, { text: "📌 Uso: *.detect on* / *.detect off*" })
  }
}

handler.help = ['detect <on/off>']
handler.tags = ['group']
handler.command = /^(detect|detector)$/i

handler.before = async function (m, { conn }) {
  if (!m.messageStubType || !m.isGroup) return
  
  let chat = global.db.data.chats[m.chat]
  if (!chat?.detect) return

  // Configuración del contacto (vcard)
  const fkontak = {
    key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "SasukeNotify" },
    message: {
      locationMessage: {
        name: "*Sasuke Bot MD 🌀*",
        jpegThumbnail: await (await fetch('https://files.catbox.moe/1j784p.jpg')).buffer(),
        vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;Sasuke;;;\nFN:Sasuke Bot\nORG:Barboza Developers\nEND:VCARD"
      }
    },
    participant: "0@s.whatsapp.net"
  }

  let usuario = `@${m.sender.split`@`[0]}`
  let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => 'https://files.catbox.moe/xr2m6u.jpg')

  // Mensajes predefinidos
  let msgs = {
    21: `✨ ${usuario} *cambió el nombre del grupo* ✨\n\n> 📝 *Nuevo:* _${m.messageStubParameters[0]}_`,
    22: `📸 *¡Nueva foto de grupo!* 📸\n\n> 💫 Acción por: ${usuario}`,
    23: `🔗 *¡El enlace del grupo fue restablecido!* 🔗\n\n> 💫 Acción por: ${usuario}`,
    25: `⚙️ ${usuario} cambió la configuración.\n\n> 🔒 *${m.messageStubParameters[0] == 'on' ? 'Solo admins' : 'Todos'}* pueden editar el grupo.`,
    26: `🗣️ El grupo fue *${m.messageStubParameters[0] == 'on' ? 'cerrado' : 'abierto'}*!\n\n> 💬 *${m.messageStubParameters[0] == 'on' ? 'Solo admins' : 'Todos'}* pueden chatear.`,
    29: `👑 @${m.messageStubParameters[0].split`@`[0]} *¡Ahora es administrador!* 👑\n\n> 💫 Acción por: ${usuario}`,
    30: `🗑️ @${m.messageStubParameters[0].split`@`[0]} *dejó de ser administrador.* 🗑️\n\n> 💫 Acción por: ${usuario}`
  }

  if (msgs[m.messageStubType]) {
    let menciones = [m.sender]
    if (m.messageStubParameters[0]?.includes('@')) menciones.push(m.messageStubParameters[0])

    if (m.messageStubType == 22) {
      await conn.sendMessage(m.chat, { image: { url: pp }, caption: msgs[m.messageStubType], mentions: menciones }, { quoted: fkontak })
    } else {
      await conn.sendMessage(m.chat, { text: msgs[m.messageStubType], mentions: menciones }, { quoted: fkontak })
    }
  }
}

export default handler
