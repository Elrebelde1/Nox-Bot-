let marriages = {} 

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const id = m.chat
    if (!marriages[id]) marriages[id] = {}

    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false

    // Comandos de Matrimonio
    if (command === 'marry' || command === 'casar') {
        if (marriages[id][m.sender]) {
            let p = marriages[id][m.sender].partner
            return m.reply(`*⚠️ Ya estás en un compromiso con @${p.split`@`[0]}.*\n_¡No puedes tener dos vínculos a la vez!_`, null, { mentions: [p] })
        }
        
        if (!who) return m.reply(`*🐍 [ ERROR ] ➔ Etiqueta a la persona con la que deseas sellar tu destino.*`)
        if (who === m.sender) return m.reply('*🤨 No puedes casarte contigo mismo.*')
        if (marriages[id][who]) return m.reply(`*⚠️ Esa persona ya está unida a alguien más.*`)

        let str = `*─── [ 💍 𝓢𝓐𝓢𝓔𝓚𝓔 - 𝓑𝓞𝓓𝓐 ] ───*\n\n*👤 @${m.sender.split`@`[0]}* solicita un vínculo con *@${who.split`@`[0]}*.\n\n*¿Aceptas?*\n\n> *⚠️ RESPONDE a este mensaje con "Si" o "No".*`
        
        let weddingMsg = await conn.reply(m.chat, str, m, { mentions: [m.sender, who] })

        // Filtro para capturar la respuesta
        const filter = (msg) => {
            const isTarget = msg.key.participant === who || msg.participant === who
            const isReply = msg.message?.extendedTextMessage?.contextInfo?.stanzaId === weddingMsg.key.id
            return isTarget && isReply && /^(si|sí|no)$/i.test(msg.message?.conversation || msg.message?.extendedTextMessage?.text || '')
        }

        try {
            // Esperar respuesta por 60 segundos
            let responseMsg = await conn.waitEvent('messages.upsert', filter, 60000)
            let body = (responseMsg.messages[0].message.conversation || responseMsg.messages[0].message.extendedTextMessage.text).toLowerCase()

            if (body.includes('si') || body.includes('sí')) {
                marriages[id][m.sender] = { partner: who, date: Date.now(), status: 'Vínculo Eterno' }
                marriages[id][who] = { partner: m.sender, date: Date.now(), status: 'Vínculo Eterno' }
                return conn.reply(m.chat, `*🎊 🎉 ¡EL VÍNCULO SE HA SELLADO! 🎉 🎊*\n\n*@${m.sender.split`@`[0]}* y *@${who.split`@`[0]}* ahora están unidos por el destino.`, m, { mentions: [m.sender, who] })
            } else {
                return m.reply(`*💔 Rechazado:* *@${who.split`@`[0]}* ha decidido seguir su camino en soledad.`, null, { mentions: [who] })
            }
        } catch (e) {
            return m.reply('*⏰ Tiempo agotado:* El destino no esperó por nadie. La propuesta ha expirado.')
        }
    }

    // Comando de Divorcio
    if (command === 'divorce' || command === 'divorciar') {
        if (!marriages[id][m.sender]) return m.reply('*⚠️ No tienes ningún vínculo activo que romper.*')
        let partner = marriages[id][m.sender].partner
        delete marriages[id][partner]
        delete marriages[id][m.sender]
        return m.reply(`*🌑 Vínculo roto:* El contrato con *@${partner.split`@`[0]}* ha terminado. Vuelves a la soledad.`, null, { mentions: [partner] })
    }

    // Ver pareja actual
    if (command === 'pareja' || command === 'boda') {
        let target = who || m.sender
        let data = marriages[id][target]
        if (!data) return m.reply(`*👤 @${target.split`@`[0]} camina en soledad.*`, null, { mentions: [target] })
        
        let partner = data.partner
        let date = new Date(data.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })
        let statusStr = `*─── [ 📜 𝓔𝓧𝓟𝓔𝓓𝓘𝓔𝓝𝓣𝓔 𝓐𝓜𝓞𝓡𝓞𝓢𝓞 ] ───*\n\n*👤 Usuario:* @${target.split`@`[0]}\n*💍 Compañero/a:* @${partner.split`@`[0]}\n*🗓️ Sello creado:* ${date}\n*✨ Estado:* ${data.status}`
        return conn.reply(m.chat, statusStr, m, { mentions: [target, partner] })
    }

    // Listado de parejas
    if (command === 'parejas') {
        let list = Object.keys(marriages[id])
        if (list.length === 0) return m.reply('*😶 No hay vínculos registrados en este grupo.*')
        
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
