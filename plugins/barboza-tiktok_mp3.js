let warns = {}
let limits = {} // Objeto para guardar los límites por grupo

let handler = async (m, { conn, text, usedPrefix, command, isAdmin, isBotAdmin }) => {
    const id = m.chat
    
    // Si no hay un límite configurado para este grupo, el default es 3
    if (!limits[id]) limits[id] = 3
    let limit = limits[id]

    // Inicializar el objeto de advertencias para este grupo si no existe
    if (!warns[id]) warns[id] = {}

    // --- COMANDO WARNLIMIT ---
    if (command === 'warnlimit') {
        if (!isAdmin) return m.reply('*[ ⚠️ ] Solo administradores.*')
        let newLimit = parseInt(text.trim())
        if (isNaN(newLimit) || newLimit < 1 || newLimit > 10) {
            return m.reply(`*─── [ ⚙️ CONFIG ] ───*\n\n*Límite actual en este grupo:* ${limit}\n\n> *♛ USO CORRECTO*\n*${usedPrefix + command}* [1-10]`)
        }
        limits[id] = newLimit
        return m.reply(`*─── [ ✅ AJUSTE ] ───*\n\n*Nuevo límite para este grupo:* ${newLimit}`)
    }

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
    if (!who && command !== 'warnlimit') return m.reply(`*⚠️ Etiqueta o responde a alguien.*\n*Ejemplo:* ${usedPrefix + command} @user motivo`)

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
            await conn.reply(m.chat, `*─── [ ×᷼× EXPULSADO ] ───*\n\n@${who.split`@`[0]} superó el límite de ${limit} advertencias y fue eliminado.`, m, { mentions: [who] })
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
        }
    }

    else if (command === 'delwarn' || command === 'quitarwarn') {
        if (!warns[id][who] || warns[id][who].count === 0) return m.reply('*El usuario no tiene advertencias.*')

        warns[id][who].count -= 1
        warns[id][who].reasons.pop()

        if (warns[id][who].count <= 0) delete warns[id][who]

        m.reply(`*✅ Advertencia removida.*\n*Estado actual:* ${warns[id][who] ? warns[id][who].count : 0}/${limit}`)
    }
}

handler.help = ['warn', 'delwarn', 'warnlist', 'warnlimit']
handler.tags = ['group']
handler.command = ['warn', 'advertir', 'delwarn', 'quitarwarn', 'warnlist', 'advertencias', 'warnlimit']
handler.group = true

export default handler
