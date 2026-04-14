let marriages = {} 

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const id = m.chat
    if (!marriages[id]) marriages[id] = {}

    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false

    // --- [ 1. COMANDO: MARRY / CASAR ] ---
    if (command === 'marry' || command === 'casar') {
        if (!who) return m.reply(`*⚠️ Etiqueta o responde a la persona con la que te quieres casar.*`)
        if (who === m.sender) return m.reply('*😂 No puedes casarte contigo mismo.*')
        
        if (marriages[id][m.sender]) return m.reply('*⚠️ Ya estás casado/a.*')
        if (marriages[id][who]) return m.reply('*⚠️ Esa persona ya está comprometida.*')

        let txt = `*💍 ✨ ¡PROPUESTA DE MATRIMONIO! ✨ 💍*\n\n*@${m.sender.split`@`[0]}* le ha pedido matrimonio a *@${who.split`@`[0]}*.\n\n*¿Aceptas?* Responde con *Si* o *No* en los próximos 60 segundos.`
        
        await conn.reply(m.chat, txt, m, { mentions: [m.sender, who] })

        // --- SISTEMA DE ESPERA DE RESPUESTA ---
        try {
            let response = await new Promise((resolve, reject) => {
                let timeout = setTimeout(() => {
                    conn.ev.off('messages.upsert', handlerMsg)
                    reject(new Error('timeout'))
                }, 60000) // 1 minuto de espera

                let handlerMsg = async ({ messages }) => {
                    let msg = messages[0]
                    if (!msg.message || msg.key.remoteJid !== id || msg.key.participant !== who) return
                    
                    let body = msg.message.conversation || msg.message.extendedTextMessage?.text || ''
                    if (/^(si|no)$/i.test(body)) {
                        clearTimeout(timeout)
                        conn.ev.off('messages.upsert', handlerMsg)
                        resolve(body.toLowerCase())
                    }
                }
                conn.ev.on('messages.upsert', handlerMsg)
            })

            if (response === 'si') {
                marriages[id][m.sender] = { partner: who, date: Date.now(), status: 'Casados' }
                marriages[id][who] = { partner: m.sender, date: Date.now(), status: 'Casados' }
                return m.reply(`*🎊 🎉 ¡VIVAN LOS NOVIOS! 🎉 🎊*\n\nSe han unido en matrimonio @${m.sender.split`@`[0]} y @${who.split`@`[0]}.`, null, { mentions: [m.sender, who] })
            } else {
                return m.reply(`*💔 Rechazado:* *@${who.split`@`[0]}* dijo que no. F.`)
            }

        } catch (e) {
            return m.reply('*⏰ Tiempo agotado:* La propuesta ha expirado.')
        }
    }

    // --- [ 2. COMANDO: DIVORCE / DIVORCIAR ] ---
    if (command === 'divorce' || command === 'divorciar') {
        if (!marriages[id][m.sender]) return m.reply('*⚠️ No tienes a nadie de quien divorciarte.*')

        let partner = marriages[id][m.sender].partner
        delete marriages[id][partner]
        delete marriages[id][m.sender]

        return m.reply(`*💔 Divorcio completado:* Ahora ambos están solteros de nuevo.`)
    }

    // --- [ 3. COMANDO: PAREJA / BODA ] ---
    if (command === 'pareja' || command === 'boda') {
        let target = who || m.sender
        let data = marriages[id][target]

        if (!data) return m.reply(`*👤 @${target.split`@`[0]} está soltero/a.*`, null, { mentions: [target] })

        let partner = data.partner
        let date = new Date(data.date).toLocaleDateString('es-HN')
        
        let statusTxt = `*─── [ 💖 PERFIL ] ───*\n\n*👤 Usuario:* @${target.split`@`[0]}\n*💍 Pareja:* @${partner.split`@`[0]}\n*🗓️ Desde:* ${date}`
        return conn.reply(m.chat, statusTxt, m, { mentions: [target, partner] })
    }

    // --- [ 4. COMANDO: PAREJAS ] ---
    if (command === 'parejas') {
        let list = Object.keys(marriages[id])
        if (list.length === 0) return m.reply('*😶 No hay matrimonios en este grupo.*')

        let txt = `*─── [ 💘 MATRIMONIOS ] ───*\n\n`
        let seen = new Set()
        for (let user of list) {
            if (seen.has(user)) continue
            let partner = marriages[id][user].partner
            txt += `*👩‍❤️‍👨 @${user.split`@`[0]}* & *@${partner.split`@`[0]}*\n`
            seen.add(user); seen.add(partner)
        }
        return conn.reply(m.chat, txt, m, { mentions: Array.from(seen) })
    }
}

handler.help = ['marry', 'divorce', 'pareja', 'parejas']
handler.tags = ['fun']
handler.command = ['marry', 'casar', 'divorce', 'divorciar', 'pareja', 'boda', 'parejas']
handler.group = true

export default handler
