let handler = async (m, { conn, args, isROwner, usedPrefix, command }) => {
    if (!isROwner) return m.reply("⚠️ Solo el creador o desarrollador puede usar este comando.")

    let bot = global.db.data.settings[conn.user.jid] || {}
    if (!bot) global.db.data.settings[conn.user.jid] = {}

    if (/on/i.test(args[0])) {
        bot.jadibotmd = true
        await conn.reply(m.chat, "✅ *Sub-Bots (JadeBot) activados.*", m)
    } else if (/off/i.test(args[0])) {
        bot.jadibotmd = false
        await conn.reply(m.chat, "❌ *Sub-Bots (JadeBot) desactivados.*", m)
    } else {
        await conn.reply(m.chat, `📌 Uso: *${usedPrefix + command} on* / *${usedPrefix + command} off*`, m)
    }
}

handler.help = ['subbots <on/off>']
handler.tags = ['owner']
handler.command = /^(subbots|serbot|jadibot)$/i

export default handler
