let marriages = {} 

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const id = m.chat
    if (!marriages[id]) marriages[id] = {}

    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false

    // Comando para casarse
    if (command === 'marry' || command === 'casar') {
        // Validación: Si el que envía el comando ya está casado
        if (marriages[id][m.sender]) {
            let pareja = marriages[id][m.sender].partner
            return m.reply(`*⚠️ Ya posees un vínculo activo con @${pareja.split`@`[0]}.*\n_Para casarte con alguien más, primero debes usar ${usedPrefix}divorce._`, null, { mentions: [pareja] })
        }
        
        if (!who) return m.reply(`*🐍 [ ERROR ] ➔ Etiqueta a la persona con la que deseas sellar tu destino.*`)
        if (who === m.sender) return m.reply('*🤨 No puedes casarte contigo mismo.*')
        
        // Validación: Si la otra persona ya está casada
        if (marriages[id][who]) {
            let parejaDeEl = marriages[id][who].partner
            return m.reply(`*⚠️ Esa persona ya está unida a @${parejaDeEl.split`@`[0]}.*`, null, { mentions: [parejaDeEl] })
        }

        let str = `*─── [ 💍 𝓢𝓐𝓢𝓤𝓚𝓔 - 𝓑𝓞𝓓𝓐 ] ───*\n\n*👤 @${m.sender.split`@`[0]}* solicita un vínculo eterno con *@${who.split`@`[0]}*.\n\n*¿Aceptas este compromiso?*\n\n> *⚠️ RESPONDE a este mensaje escribiendo "Acepto" o "Rechazo".*`
        
        let weddingMsg = await conn.reply(m.chat, str, m, { mentions: [m.sender, who] })

        try {
            let response = await new Promise((resolve, reject) => {
                let timeout = setTimeout(() => {
                    conn.ev.off('messages.upsert', handlerMsg)
                    reject(new Error('timeout'))
                }, 60000) // 1 minuto para responder

                let handlerMsg = async ({ messages }) => {
                    let msg = messages[0]
                    if (!msg.message || msg.key.remoteJid !== id || (msg.key.participant || msg.participant) !== who) return
                    
                    let cited = msg.message.extendedTextMessage?.contextInfo?.stanzaId
                    if (cited !== weddingMsg.key.id) return

                    let body = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim().toLowerCase()

                    if (body === 'acepto' || body === 'rechazo') {
                        clearTimeout(timeout)
                        conn.ev.off('messages.upsert', handlerMsg)
                        resolve(body)
                    }
                }
                conn.ev.on('messages.upsert', handlerMsg)
            })

            if (response === 'acepto') {
                marriages[id][m.sender] = { partner: who, date: Date.now(), status: 'Vínculo Eterno' }
                marriages[id][who] = { partner: m.sender, date: Date.now(), status: 'Vínculo Eterno' }
                return conn.reply(m.chat, `*🎊 🎉 ¡EL VÍNCULO SE HA SELLADO! 🎉 🎊*\n\n*@${m.sender.split`@`[0]}* y *@${who.split`@`[0]}* ahora están unidos bajo el Sello Eterno.`, m, { mentions: [m.sender, who] })
            } else {
                return m.reply(`*💔 Rechazado:* *@${who.split`@`[0]}* ha rechazado la propuesta. El destino los mantendrá separados.`, null, { mentions: [who] })
            }
        } catch (e) {
            return m.reply('*⏰ Tiempo agotado:* El silencio fue la única respuesta. La propuesta ha expirado.')
        }
    }

    // Comando para divorcio
    if (command === 'divorce' || command === 'divorciar') {
        if (!marriages[id][m.sender]) return m.reply('*⚠️ No tienes ningún vínculo que romper.*')
        let partner = marriages[id][m.sender].partner
        delete marriages[id][partner]
        delete marriages[id][m.sender]
        return m.reply(`*🌑 Vínculo roto:* Has disuelto tu unión con *@${partner.split`@`[0]}*. Vuelves a la soledad.`, null, { mentions: [partner] })
    }

    // Ver estado de pareja
    if (command === 'pareja' || command === 'boda') {
        let target = who || m.sender
        let data = marriages[id][target]
        if (!data) return m.reply(`*👤 @${target.split`@`[0]} camina en soledad.*`, null, { mentions: [target] })
        
        let partner = data.partner
        let date = new Date(data.date).toLocaleDateString('es-ES')
        let statusStr = `*─── [ 📜 𝓔𝓧𝓟𝓔𝓓𝓘𝓔𝓝𝓣𝓔 𝓐𝓜𝓞𝓡𝓞𝓢𝓞 ] ───*\n\n*👤 Usuario:* @${target.split`@`[0]}\n*💍 Compañero/a:* @${partner.split`@`[0]}\n*🗓️ Sello creado:* ${date}\n*✨ Estado:* ${data.status}`
        return conn.reply(m.chat, statusStr, m, { mentions: [target, partner] })
    }

    // Listado de parejas del grupo
    if (command === 'parejas') {
        let list = Object.keys(marriages[id])
        if (list.length === 0) return m.reply('*😶 No hay vínculos registrados en esta zona.*')
        
        let listStr = `*─── [ 💘 𝓥𝓘𝓝𝓒𝓤𝓛𝓞𝓢 𝓓𝓔𝓛 𝓖𝓡𝓤𝓟𝓞 ] ───*\n\n`
        let seen = new Set()
        for (let user of list) {
            if (seen.has(user)) continue
            let partner = marriages[id][user].partner
            listStr += `*🦅 @${user.split`@`[0]}* ∞ *@${partner.split`@`[0]}*\n`
            seen.add(user)
            seen.add(partner)
        }
        return conn.reply(m.chat, listStr, m, { mentions: Array.from(seen) })
    }
}

handler.help = ['marry', 'divorce', 'pareja', 'parejas']
handler.tags = ['fun']
handler.command = ['marry', 'casar', 'divorce', 'divorciar', 'pareja', 'boda', 'parejas']
handler.group = true

export default handler
