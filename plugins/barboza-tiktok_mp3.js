let warns = {}

let handler = async (m, { conn, text, usedPrefix, command, isAdmin, isBotAdmin }) => {
    const id = m.chat
    const limit = 3 // Límite fijo de 3 advertencias

    // Inicializar el objeto de advertencias para este grupo si no existe
    if (!warns[id]) warns[id] = {}

    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false

    if (['warnlist', 'advertencias'].includes(command)) {
        if (!who) {
            let list = Object.keys(warns[id])
            if (list.length === 0) return m.reply('*⚖️ El grupo está limpio.*')
            let txt = `*─── [ ⚖️ LISTA DE ADVERTIDOS ] ───*\n\n`
            for (let user of list) {
                txt += `*👤 @${user.split`@`[0]}* - [ ${warns[id][user].count}/${limit} ]\n`
            }
            return conn.reply(m.chat, txt, m, { mentions: list })
        }
        let userWarns = warns[id][who]
        if (!userWarns || userWarns.count === 0) return m.reply('*✅ El usuario está limpio.*')
        
        let detail = `*─── [ ⚖️ EXPEDIENTE ] ───*\n\n*👤 Usuario:* @${who.split`@`[0]}\n*🛡 Advertencias:* ${userWarns.count}/${limit}\n\n*◈ MOTIVOS:*`
        userWarns.reasons.forEach((r, i) => { detail += `\n*${i + 1}.* ${r}` })
        return conn.reply(m.chat, detail, m, { mentions: [who] })
    }

    if (!isAdmin) return m.reply('*[ ⚠️ ] Solo administradores.*')
    if (!who) return m.reply(`*⚠️ Etiqueta o responde a alguien.*\n*Ejemplo:* ${usedPrefix + command} @user motivo`)

    if (command === 'warn' || command === 'advertir') {
        if (!isBotAdmin) return m.reply('*[ ⚠️ ] Necesito ser Admin para expulsar.*')
        
        if (!warns[id][who]) warns[id][who] = { count: 0, reasons: [] }
        
        let reason = text ? text.replace(/@(\d+)/g, '').trim() : 'Sin motivo'
        warns[id][who].count += 1
        warns[id][who].reasons.push(`${reason} (${new Date().toLocaleDateString('es-HN')})`)

        if (warns[id][who].count < limit) {
            let txt = `*─── [ ▶ ADVERTENCIA ] ───*\n\n*♛ Usuario:* @${who.split`@`[0]}\n*✰ Advertencias:* ${warns[id][who].count}/${limit}\n*⍰ Motivo:* ${reason}`
            await conn.reply(m.chat, txt, m, { mentions: [who] })
        } else {
            delete warns[id][who]
            await conn.reply(m.chat, `*─── [ ×᷼× EXPULSADO ] ───*\n\n@${who.split`@`[0]} superó el límite de advertencias y fue eliminado.`, m, { mentions: [who] })
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
        }
    }

    else if (command === 'delwarn' || command === 'quitarwarn') {
        if (!warns[id][who] || warns[id][who].count === 0) return m.reply('*El usuario no tiene advertencias.*')
        
        warns[id][who].count -= 1
        warns[id][who].reasons.pop()
        
        if (warns[id][who].count <= 0) delete warns[id][who]
        
        m.reply(`*✅ Advertencia removida.*`)
    }
}

handler.help = ['warn', 'delwarn', 'warnlist']
handler.tags = ['group']
handler.command = ['warn', 'advertir', 'delwarn', 'quitarwarn', 'warnlist', 'advertencias']
handler.group = true

export default handler
