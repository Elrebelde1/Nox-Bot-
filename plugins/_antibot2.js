const handler = async (m, { conn, args, isAdmin, isOwner }) => {
    // Verificación de permisos
    if (!isAdmin && !isOwner) throw "⚠️ Solo los administradores pueden usar este comando."

    let chat = global.db.data.chats[m.chat]
    if (!chat) global.db.data.chats[m.chat] = {}

    if (/on/i.test(args[0])) {
        chat.antiBot = true
        await conn.reply(m.chat, "✅ *Anti-Bot activado.* Otros bots serán eliminados automáticamente.", m)
    } else if (/off/i.test(args[0])) {
        chat.antiBot = false
        await conn.reply(m.chat, "❌ *Anti-Bot desactivado.*", m)
    } else {
        await conn.reply(m.chat, "📌 Uso: *.antibot on* / *.antibot off*", m)
    }
}

handler.help = ['antibot <on/off>']
handler.tags = ['group']
handler.command = /^(antibot)$/i

handler.before = async function (m, { conn, isBotAdmin }) {
    if (!m.isGroup) return 
    let chat = global.db.data.chats[m.chat]
    let bot = global.db.data.settings[conn.user.jid] || {}

    // Si el Anti-Bot está desactivado o el mensaje es del propio bot, ignorar
    if (!chat?.antiBot || m.fromMe) return 

    // Detección de IDs típicos de bots (como los de Baileys/3EB0)
    if (m.id.startsWith('3EB0') && m.id.length === 22) {
        
        await conn.reply(m.chat, `     ͞ ͟͞ ͟${global.packname || 'Bot'}͟͞ ͟ ͟͞ ͞   \n╚▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬ִ▭࣪▬▭╝\n\n𝑆𝑜𝑦 ${global.botname || 'Sasuke'} 𝑒𝑙 𝑚𝑒𝑗𝑜𝑟 𝑏𝑜𝑡 𝑑𝑒 𝑾𝒉𝒂𝒕𝒔𝑨𝒑𝒑!!\n𝐸𝑠𝑡𝑒 𝑔𝑟𝑢𝑝𝑜 𝑛𝑜 𝑡𝑒 𝑛𝑒𝑐𝑒𝑠𝑖𝑡𝑎, 𝑎𝑑𝑖𝑜𝑠𝑖𝑡𝑜 𝑏𝑜𝑡 𝑑𝑒 𝑠𝑒𝑔𝑢𝑛𝑑𝑎.`, m)

        if (isBotAdmin) {
            // Eliminar el mensaje del bot intruso
            await conn.sendMessage(m.chat, { 
                delete: { 
                    remoteJid: m.chat, 
                    fromMe: false, 
                    id: m.id, 
                    participant: m.sender 
                }
            })
            // Expulsar al bot intruso
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        }
    }
}

export default handler
