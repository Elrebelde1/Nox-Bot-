let handler = async (m, { conn, isAdmin, isROwner }) => {
    if (!(isAdmin || isROwner)) return dfail('admin', m, conn)
    
    global.db.data.chats[m.chat].isBanned = false
    
    let txt = `┏━━━━━━━━━━━━━━━━━━┓\n`
    txt += `┃ ✨ *BOT ACTIVADO* ✨\n`
    txt += `┃━━━━━━━━━━━━━━━━━━┃\n`
    txt += `┃ 📝 *Estado:* Operativo\n`
    txt += `┃ 🛡️ *Admin:* ${m.pushName}\n`
    txt += `┃ ✅ *Listo para usar*\n`
    txt += `┗━━━━━━━━━━━━━━━━━━┛`

    await conn.reply(m.chat, txt, m, rcanal)
    await m.react('🔋')
}

handler.help = ['desbanearbot']
handler.tags = ['group']
handler.command = ['desbanearbot', 'unbanchat']
handler.group = true 

export default handler
