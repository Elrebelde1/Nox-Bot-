import { WAMessageStubType } from '@whiskeysockets/baileys'
import { readFileSync } from 'fs'
import { join } from 'path'

const handler = async (m, { conn, args, isAdmin, isOwner }) => {
  if (!isAdmin && !isOwner) throw "⚠️ Solo los administradores pueden usar este comando."

  let chat = global.db.data.chats[m.chat]
  if (!chat) global.db.data.chats[m.chat] = {}

  if (/on/i.test(args[0])) {
    chat.bienvenida = true
    await conn.reply(m.chat, "✅ *Bienvenida activada* en este grupo.", m)
  } else if (/off/i.test(args[0])) {
    chat.bienvenida = false
    await conn.reply(m.chat, "❌ *Bienvenida desactivada*.", m)
  } else {
    await conn.reply(m.chat, "📌 Uso: *.bienvenida on* / *.bienvenida off*", m)
  }
}

handler.help = ['bienvenida <on/off>']
handler.tags = ['group']
handler.command = /^(bienvenida|welcome|bye)$/i

handler.before = async function (m, { conn, groupMetadata }) {
  try {
    // Solo actuar si hay un cambio en los participantes y es un grupo
    if (!m.messageStubType || !m.isGroup) return !0

    const chat = global.db?.data?.chats?.[m.chat]
    if (!chat || !chat.bienvenida) return !0

    // Intentar leer la imagen (ajusta la ruta si es necesario)
    let img
    try {
      img = readFileSync(join(process.cwd(), 'storage', 'img', 'catalogo.png'))
    } catch {
      img = { url: 'https://files.catbox.moe/1j784p.jpg' } // Fallback si no existe localmente
    }

    const userJid = m.messageStubParameters?.[0] || m.participant
    if (!userJid) return !0

    const userTag = `@${userJid.split('@')[0]}`
    const groupName = groupMetadata.subject
    const groupDesc = groupMetadata.desc || 'Disfruta tu estadía.'
    const membersCount = groupMetadata.participants.length

    let txt = ''

    switch (m.messageStubType) {
      case WAMessageStubType.GROUP_PARTICIPANT_ADD:
        txt = chat.customWelcome ? chat.customWelcome.replace(/@user/gi, userTag).replace(/@group/gi, groupName).replace(/@desc/gi, groupDesc) : 
        `😏 *Vaya, alguien nuevo...*\n\nBienvenido ${userTag} a *${groupName}*.\n\n📂 *REGISTRO DE ACCESO:*\n│ 👤 *Miembro:* #${membersCount}\n│ 🛠️ *Creador: Barboza*\n│ 📝 *Info:* ${groupDesc}\n\n> Intenta no hacer que te echen rápido.`;
        break

      case WAMessageStubType.GROUP_PARTICIPANT_LEAVE:
        txt = chat.customBye ? chat.customBye.replace(/@user/gi, userTag).replace(/@group/gi, groupName) : 
        `🏃‍♂️ *Uno menos, ni falta que hacía.*\n\n${userTag} no aguantó el nivel de *${groupName}*.\n\n📉 *Quedamos:* ${membersCount} sobrevivientes.`;
        break

      case WAMessageStubType.GROUP_PARTICIPANT_REMOVE:
        txt = chat.customKick ? chat.customKick.replace(/@user/gi, userTag).replace(/@group/gi, groupName) : 
        `⚡ *SISTEMA: ACCESO DENEGADO*\n\n${userTag} fue borrado de la existencia en *${groupName}*.\n\n🚮 *Causa:* Estorbaba.\n👥 *Población actual:* ${membersCount}`;
        break
    }

    if (txt) {
      await conn.sendMessage(m.chat, { 
        image: typeof img === 'string' ? { url: img } : img, 
        caption: txt, 
        mentions: [userJid] 
      })
    }

  } catch (e) {
    console.error("Error en Bienvenida:", e)
  }
  return !0
}

export default handler
