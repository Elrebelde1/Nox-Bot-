let handler = async (m, { conn, text, participants }) => {
    let member = participants.map(u => u.id)
    
    if (!text) {
        var sum = member.length
    } else {
        var sum = text
    }

    var total = 0
    var sider = []

    for (let i = 0; i < sum; i++) {
        let id = member[i]
        let users = m.isGroup ? participants.find(u => u.id == id) : {}
        let userDb = global.db.data.users[id]

        // Filtro de inactivos (No están en DB, chat en 0 y NO son admins)
        if ((typeof userDb == 'undefined' || userDb.chat == 0) && !users.isAdmin && !users.isSuperAdmin) { 
            if (typeof userDb !== 'undefined') {
                if (userDb.whitelist == false) {
                    total++
                    sider.push(id)
                }
            } else {
                total++
                sider.push(id)
            }
        }
    }

    if (total == 0) return conn.reply(m.chat, `*[❗𝙸𝙽𝙵𝙾❗]* 𝙴𝚂𝚃𝙴 𝙶𝚁𝚄𝙿𝙾 𝙽𝙾 𝚃𝙸𝙴𝙽𝙴 𝙵𝙰𝙽𝚃𝙰𝚂𝙼𝙰𝚂, 𝚀𝚄𝙴 𝙱𝚄𝙴𝙽 𝚃𝚁𝙰𝙱𝙰𝙹𝙾 𝙷𝙰𝙲𝙴 𝙴𝙻 𝙰𝙳𝙼𝙸𝙽`, m) 

    // Formato de lista con menciones directas
    let txt = `[ ⚠ 𝚁𝙴𝚅𝙸𝙲𝙸𝙾𝙽 𝙸𝙽𝙰𝙲𝚃𝙸𝚅𝙰 ⚠ ]\n\n`
    txt += `𝙶𝚁𝚄𝙿𝙾: ${await conn.getName(m.chat)}\n`
    txt += `𝙼𝙸𝙴𝙼𝙱𝚁𝙾𝚂 𝙰𝙽𝙰𝙻𝙸𝚉𝙰𝙳𝙾𝚂: ${sum}\n\n`
    txt += `[ ⇲ 𝙻𝙸𝚂𝚃𝙰 𝙳𝙴 𝙵𝙰𝙽𝚃𝙰𝚂𝙼𝙰𝚂 ⇱ ]\n`
    txt += sider.map(v => `👻 @${v.replace(/@.+/, '')}`).join('\n')
    txt += `\n\n𝙽𝙾𝚃𝙰: 𝙴𝚜𝚝𝚘𝚜 𝚞𝚜𝚞𝚊𝚛𝚒𝚘𝚜 𝚗𝚘 𝚑𝚊𝚗 𝚎𝚗𝚟𝚒𝚊𝚍𝚘 𝚖𝚎𝚗𝚜𝚊𝚓𝚎𝚜 𝚛𝚎𝚌𝚒𝚎𝚗𝚝𝚎𝚜.`

    // Se envían las menciones de todos los inactivos
    await conn.sendMessage(m.chat, { text: txt, mentions: sider }, { quoted: m })
}

handler.help = ['fantasmas']
handler.tags = ['group']
handler.command = /^(verfantasmas|fantasmas|sider)$/i
handler.admin = true

export default handler
