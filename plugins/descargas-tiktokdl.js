let marriages = {} // Objeto para almacenar las parejas

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const id = m.chat
    if (!marriages[id]) marriages[id] = {}

    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false

    // --- [ 1. COMANDO: MARRY / CASAR ] ---
    if (command === 'marry' || command === 'casar') {
        if (!who) return m.reply(`*⚠️ Etiqueta o responde al mensaje de la persona con la que te quieres casar.*`)
        if (who === m.sender) return m.reply('*😂 No puedes casarte contigo mismo.*')
        if (who === conn.user.jid) return m.reply('*🛡️ Lo siento, yo solo estoy casado con mi código.*')

        // Verificar si alguno ya está casado
        if (marriages[id][m.sender]) return m.reply('*⚠️ Ya estás casado/a. Primero divórciate.*')
        if (marriages[id][who]) return m.reply('*⚠️ Esa persona ya está en un compromiso.*')

        let name1 = conn.getName(m.sender)
        let name2 = conn.getName(who)

        let txt = `*💍 ✨ ¡PROPUESTA DE MATRIMONIO! ✨ 💍*\n\n*@${m.sender.split`@`[0]}* le ha pedido matrimonio a *@${who.split`@`[0]}*.\n\n*¿Aceptas, @${who.split`@`[0]}?*\nResponde con "Si" para aceptar o "No" para rechazar.`
        
        await conn.reply(m.chat, txt, m, { mentions: [m.sender, who] })

        // Filtro para esperar respuesta del receptor
        const filter = m => m.sender === who && /^(si|no)$/i.test(m.text)
        const response = await m.chat.collectMessages({ filter, max: 1, time: 60000 })

        if (response.length > 0) {
            if (response[0].text.toLowerCase() === 'si') {
                marriages[id][m.sender] = { partner: who, date: Date.now(), status: 'Casados' }
                marriages[id][who] = { partner: m.sender, date: Date.now(), status: 'Casados' }
                return m.reply(`*🎊 🎉 ¡VIVAN LOS NOVIOS! 🎉 🎊*\n\n*${name1}* y *${name2}* ahora están legalmente casados en este grupo.`)
            } else {
                return m.reply(`*💔 F en el chat:* *@${who.split`@`[0]}* ha rechazado la propuesta.`)
            }
        } else {
            return m.reply('*⏰ Se acabó el tiempo:* La propuesta ha expirado.')
        }
    }

    // --- [ 2. COMANDO: DIVORCE / DIVORCIAR ] ---
    if (command === 'divorce' || command === 'divorciar') {
        if (!marriages[id][m.sender]) return m.reply('*⚠️ Ni siquiera estás casado/a...*')

        let partner = marriages[id][m.sender].partner
        delete marriages[id][partner]
        delete marriages[id][m.sender]

        return m.reply(`*💔 Triste noticia:* El matrimonio ha terminado. Ahora ambos están solteros.`)
    }

    // --- [ 3. COMANDO: PAREJA / BODA / STATUS ] ---
    if (command === 'pareja' || command === 'boda') {
        let target = who || m.sender
        let data = marriages[id][target]

        if (!data) return m.reply(`*👤 @${target.split`@`[0]} está soltero/a por ahora.*`, null, { mentions: [target] })

        let partner = data.partner
        let date = new Date(data.date).toLocaleDateString('es-HN')
        
        let statusTxt = `*─── [ 💖 PERFIL DE PAREJA ] ───*\n\n`
        statusTxt += `*👤 Usuario:* @${target.split`@`[0]}\n`
        statusTxt += `*💍 Pareja:* @${partner.split`@`[0]}\n`
        statusTxt += `*🗓️ Casados desde:* ${date}\n`
        statusTxt += `*✨ Estado:* ${data.status}`

        return conn.reply(m.chat, statusTxt, m, { mentions: [target, partner] })
    }

    // --- [ 4. COMANDO: PAREJAS (LISTADO) ] ---
    if (command === 'parejas' || command === 'listapasejas') {
        let list = Object.keys(marriages[id])
        if (list.length === 0) return m.reply('*😶 No hay parejas formadas en este grupo todavía.*')

        let txt = `*─── [ 💘 CLUB DE PAREJAS ] ───*\n\n`
        let seen = new Set()
        
        for (let user of list) {
            if (seen.has(user)) continue
            let partner = marriages[id][user].partner
            txt += `*👩‍❤️‍👨 @${user.split`@`[0]}* & *@${partner.split`@`[0]}*\n`
            seen.add(user)
            seen.add(partner)
        }
        return conn.reply(m.chat, txt, m, { mentions: Array.from(seen) })
    }
}

handler.help = ['marry', 'divorce', 'pareja', 'parejas']
handler.tags = ['fun']
handler.command = ['marry', 'casar', 'divorce', 'divorciar', 'pareja', 'boda', 'parejas', 'listaparejas']
handler.group = true

export default handler
