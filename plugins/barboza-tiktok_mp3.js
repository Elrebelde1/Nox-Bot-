let warns = {}
let limits = {} 

let handler = async (m, { conn, text, usedPrefix, command, isAdmin, isBotAdmin }) => {
    const id = m.chat
    
    // Configuración de límite por grupo (por defecto 3)
    if (!limits[id]) limits[id] = 3
    let limit = limits[id]

    if (!warns[id]) warns[id] = {}

    // 1. --- [ MEJORA: WARNLIMIT ] ---
    if (command === 'warnlimit') {
        if (!isAdmin) return m.reply('*[ ⚠️ ] Solo administradores.*')
        let newLimit = parseInt(text.trim())
        if (isNaN(newLimit) || newLimit < 1 || newLimit > 10) {
            return m.reply(`*─── [ ⚙️ CONFIG ] ───*\n\n*Límite actual:* ${limit}\n\n*Uso:* ${usedPrefix + command} [1-10]`)
        }
        limits[id] = newLimit
        return m.reply(`*✅ Límite de advertencias actualizado a:* ${newLimit}`)
    }

    // 2. --- [ MEJORA: WARNRESET (GRUPO) ] ---
    if (command === 'warnreset') {
        if (!isAdmin) return m.reply('*[ ⚠️ ] Solo administradores.*')
        warns[id] = {}
        return m.reply('*⚖️ Se ha reiniciado el historial de advertencias de todo el grupo.*')
    }

    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false

    // --- COMANDO WARNLIST ---
    if (['warnlist', 'advertencias'].includes(command)) {
        if (!who) {
            let list = Object.keys(warns[id])
            if (list.length === 0) return m.reply('*⚖️ El grupo no tiene usuarios advertidos.*')
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
    if (!who && command !== 'warnlimit' && command !== 'warnreset') return m.reply(`*⚠️ Etiqueta o responde a alguien.*`)

    // 3. --- [ MEJORA: BYPASS SEGURIDAD ] ---
    let groupMetadata = await conn.groupMetadata(m.chat)
    let isAdminTarget = groupMetadata.participants.find(p => p.id === who)?.admin
    if (isAdminTarget || who === conn.user.jid) return m.reply('*🛡️ Seguridad: No puedes advertir a un Administrador o al propio Bot.*')

    // --- COMANDO WARN ---
    if (command === 'warn' || command === 'advertir') {
        if (!isBotAdmin) return m.reply('*[ ⚠️ ] Necesito ser Admin para ejecutar la expulsión.*')

        if (!warns[id][who]) warns[id][who] = { count: 0, reasons: [], lastWarn: 0 }

        // 4. --- [ MEJORA: AUTO-RESET (24H) ] ---
        let now = Date.now()
        let timePassed = now - warns[id][who].lastWarn
        if (warns[id][who].count > 0 && timePassed > 86400000) { 
            warns[id][who].count -= 1
            warns[id][who].reasons.shift() 
            await conn.reply(m.chat, '*✨ 1 Advertencia perdonada automáticamente por buen comportamiento (pasaron 24h).*', m)
        }

        let reason = text ? text.replace(/@(\d+)/g, '').trim() : 'Sin motivo'
        warns[id][who].count += 1
        warns[id][who].reasons.push(`${reason} (${new Date().toLocaleDateString('es-HN')})`)
        warns[id][who].lastWarn = now

        if (warns[id][who].count < limit) {
            let txt = `*─── [ ▶ ADVERTENCIA ] ───*\n\n*♛ Usuario:* @${who.split`@`[0]}\n*✰ Advertencias:* ${warns[id][who].count}/${limit}\n*⍰ Motivo:* ${reason}`
            await conn.reply(m.chat, txt, m, { mentions: [who] })
        } else {
            delete warns[id][who]
            await conn.reply(m.chat, `*─── [ ×᷼× EXPULSADO ] ───*\n\n@${who.split`@`[0]} alcanzó el límite de ${limit} advertencias y fue eliminado.`, m, { mentions: [who] })
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove')
        }
    }

    // 5. --- [ MEJORA: DELWARN / DELWARN ALL ] ---
    else if (command === 'delwarn' || command === 'quitarwarn') {
        if (!warns[id][who] || warns[id][who].count === 0) return m.reply('*El usuario no tiene advertencias en su contra.*')

        if (text.toLowerCase().includes('all')) {
            delete warns[id][who]
            return m.reply(`*✅ Se han eliminado todas las advertencias de @${who.split`@`[0]}*`, null, { mentions: [who] })
        }

        warns[id][who].count -= 1
        warns[id][who].reasons.pop()
        if (warns[id][who].count <= 0) delete warns[id][who]

        m.reply(`*✅ Advertencia removida.*`)
    }
}

handler.help = ['warn', 'delwarn', 'warnlist', 'warnlimit', 'warnreset']
handler.tags = ['group']
handler.command = ['warn', 'advertir', 'delwarn', 'quitarwarn', 'warnlist', 'advertencias', 'warnlimit', 'warnreset','setwarn']
handler.group = true

export default handler
