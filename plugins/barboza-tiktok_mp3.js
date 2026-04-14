let handler = async (m, { conn, text, usedPrefix, command, isAdmin, isBotAdmin }) => {
    try {
        let chat = global.db.data.chats[m.chat] || {}
        let limit = chat.warnLimit || 3

        if (command === 'warnlimit') {
            if (!isAdmin) return global.dfail('admin', m, conn)
            let newLimit = parseInt(text.trim())
            if (isNaN(newLimit) || newLimit < 1 || newLimit > 10) {
                return conn.reply(m.chat, `*─── [ ⚙️ CONFIG ] ───*\n\n*Límite actual:* ${limit}\n\n> *♛ USO CORRECTO*\n*${usedPrefix + command}* [1-10]`, m)
            }
            chat.warnLimit = newLimit
            return conn.reply(m.chat, `*─── [ ✅ AJUSTE ] ───*\n\n*Nuevo límite:* ${newLimit}`, m)
        }

        let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
        
        if (!global.db.data.users[who]) global.db.data.users[who] = { warn: 0, warnReasons: [] }
        let user = global.db.data.users[who]

        if (['warnlist', 'advertencias'].includes(command)) {
            if (who) {
                if (!user.warn || user.warn === 0) {
                    return conn.reply(m.chat, `*─── [ ⚖ REGISTRO ] ───*\n\n_El usuario @${who.split`@`[0]} está limpio._`, m, { mentions: [who] })
                }
                let detail = `*─── [ ⚖ EXPEDIENTE ] ───*\n\n*👤 Usuario:* @${who.split`@`[0]}\n*🛡 Estado:* ${user.warn}/${limit}\n\n*◈ HISTORIAL:* \n`
                user.warnReasons.forEach((reason, i) => { detail += `\n*${i + 1}.* ${reason}` })
                return conn.reply(m.chat, detail, m, { mentions: [who] })
            }
            return conn.reply(m.chat, `*⚠️ Etiqueta a alguien para ver su historial.*`, m)
        }

        if (!isAdmin) return global.dfail('admin', m, conn)
        if (!who) return conn.reply(m.chat, `*⚠️ Etiqueta o responde a un mensaje.*`, m)

        if (command === 'warn' || command === 'advertir') {
            if (!isBotAdmin) return global.dfail('botAdmin', m, conn)
            let reason = text ? text.replace(/@(\d+)/g, '').trim() : 'Sin motivo'
            
            user.warn += 1
            user.warnReasons.push(`${reason} (${new Date().toLocaleDateString('es-HN')})`)

            if (user.warn < limit) {
                let txt = `*─── [ ▶ ADVERTENCIA ] ───*\n\n*♛ Usuario:* @${who.split`@`[0]}\n*✰ Advertencias:* ${user.warn}/${limit}\n*⍰ Motivo:* ${reason}`
                await conn.reply(m.chat, txt, m, { mentions: [who] })
            } else {
                user.warn = 0
                user.warnReasons = []
                await conn.reply(m.chat, `*─── [ ×᷼× EXPULSADO ] ───*\n\n@${who.split`@`[0]} superó el límite de ${limit} advertencias.`, m, { mentions: [who] })
                await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
            }
        }

        else if (command === 'delwarn' || command === 'quitarwarn') {
            if (!user.warn || user.warn === 0) return m.reply('El usuario no tiene advertencias.')
            user.warn -= 1
            user.warnReasons.pop()
            return conn.reply(m.chat, `*✅ Advertencia removida.*\n*Estado:* ${user.warn}/${limit}`, m, { mentions: [who] })
        }

    } catch (e) {
        console.error(e)
        m.reply('❌ Error: Asegúrate de que el sistema de base de datos (global.db.data) esté activo.')
    }
}

handler.help = ['warn', 'delwarn', 'warnlist', 'warnlimit']
handler.tags = ['group']
handler.command = ['warn', 'advertir', 'delwarn', 'quitarwarn', 'warnlist', 'advertencias', 'warnlimit']
handler.group = true

export default handler
