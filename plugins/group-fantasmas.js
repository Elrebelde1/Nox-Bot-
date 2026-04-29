let handler = async (m, { conn, text, participants }) => {
    let member = participants.map(u => u.id)
    let now = new Date().getTime() // Tiempo actual
    
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

        // Filtro: No está en DB o chat es 0, y NO es admin
        if ((typeof userDb == 'undefined' || userDb.chat == 0) && !users.isAdmin && !users.isSuperAdmin) {
            if (typeof userDb !== 'undefined') {
                if (userDb.whitelist == false) {
                    total++
                    sider.push({ id, lastChat: userDb.lastseen || 0 }) // Usamos lastseen o un valor por defecto
                }
            } else {
                total++
                sider.push({ id, lastChat: 0 })
            }
        }
    }

    if (total == 0) return conn.reply(m.chat, `*[❗𝙸𝙽𝙵𝙾❗]* 𝙴𝚂𝚃𝙴 𝙶𝚁𝚄𝙿𝙾 𝙽𝙾 𝚃𝙸𝙴𝙽𝙴 𝙵𝙰𝙽𝚃𝙰𝚂𝙼𝙰𝚂, 𝚀𝚄𝙴 𝙱𝚄𝙴𝙽 𝚃𝚁𝙰𝙱𝙰𝙹𝙾 𝙷𝙰𝙲𝙴 𝙴𝙻 𝙰𝙳𝙼𝙸𝙽`, m)

    let list = sider.map(v => {
        let tiempo = v.lastChat === 0 ? 'Sin registros' : msToTime(now - v.lastChat)
        return `👻 @${v.id.replace(/@.+/, '')}\n   *Última vez:* ${tiempo}`
    }).join('\n\n')

    m.reply(`[ ⚠ 𝚁𝙴𝚅𝙸𝙲𝙸𝙾𝙽 𝙸𝙽𝙰𝙲𝚃𝙸𝚅𝙰  ⚠ ]\n\n𝙶𝚁𝚄𝙿𝙾: ${await conn.getName(m.chat)}\n𝙼𝙸𝙴𝙼𝙱𝚁𝙾𝚂 𝙰𝙽𝙰𝙻𝙸𝚉𝙰𝙳𝙾𝚂: ${sum}\n\n[ ⇲ 𝙻𝙸𝚂𝚃𝙰 𝙳𝙴 𝙵𝙰𝙽𝚃𝙰𝚂𝙼𝙰𝚂 ⇱ ]\n${list}\n\n𝙽𝙾𝚃𝙰: 𝙴𝚕 𝚝𝚒𝚎𝚖𝚙𝚘 se cuenta desde que el bot está activo en el grupo.`, null, { mentions: sider.map(v => v.id) })
}

handler.help = ['fantasmas']
handler.tags = ['group']
handler.command = /^(verfantasmas|fantasmas|sider)$/i
handler.admin = true

export default handler

// Función para formatear el tiempo
function msToTime(duration) {
    if (duration < 0) return "Hace un momento"
    let seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
        days = Math.floor(duration / (1000 * 60 * 60 * 24))

    let res = []
    if (days > 0) res.push(`${days} días`)
    if (hours > 0) res.push(`${hours} horas`)
    if (minutes > 0) res.push(`${minutes} minutos`)
    
    return res.length > 0 ? res.join(', ') : "Hace un momento"
}
