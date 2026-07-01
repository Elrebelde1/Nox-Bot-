let handler = async (m, { conn, participants, text }) => {
    if (!text) return m.reply('Indica el top, idiota.')
    
    let members = participants.map(u => u.id)
    let selected = []
    
    while (selected.length < 10 && selected.length < members.length) {
        let user = members[Math.floor(Math.random() * members.length)]
        if (!selected.includes(user)) selected.push(user)
    }
    
    let list = selected.map((v, i) => `${i + 1}. @${v.split('@')[0]}`).join('\n')
    
    let result = `*Top 10 ${text}*

${list}

Desarrollado por: Sebastián Barboza`
    
    conn.reply(m.chat, result, m, { mentions: selected })
}

handler.help = ['top']
handler.tags = ['grupos']
handler.command = ['top']
handler.group = true

export default handler
