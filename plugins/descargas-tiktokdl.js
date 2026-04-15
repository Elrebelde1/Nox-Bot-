let marriages = {} 

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const id = m.chat
    if (!marriages[id]) marriages[id] = {}

    if (command === 'marry' || command === 'casar') {
        let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
        if (!who) return m.reply(`*🐍 [ ERROR ] ➔ Etiqueta a alguien.*`)
        if (who === m.sender) return m.reply('*🤨 No puedes casarte contigo mismo.*')
        if (marriages[id][m.sender]) return m.reply('*⚠️ Ya estás casado/a.*')
        if (marriages[id][who]) return m.reply('*⚠️ Esa persona ya tiene pareja.*')

        global.db.data.users[who].pasaporte = m.sender 
        
        let str = `*─── [ 💍 𝓢𝓐𝓢𝓤𝓚𝓔 - 𝓑𝓞𝓓𝓐 ] ───*\n\n*👤 @${m.sender.split`@`[0]}* solicita un vínculo con *@${who.split`@`[0]}*.\n\n*¿Aceptas?*\n\n> *⚠️ RESPONDE a este mensaje con "Si" o "No".*`
        return conn.reply(m.chat, str, m, { mentions: [m.sender, who] })
    }

    if (m.quoted && m.quoted.text.includes('𝓢𝓐𝓢𝓤𝓚𝓔 - 𝓑𝓞𝓓𝓐')) {
        let body = m.text.toLowerCase()
        if (!/^(si|sí|no)$/i.test(body)) return
        
        let userPropuesto = m.sender
        let userInteresado = global.db.data.users[userPropuesto].pasaporte

        if (!userInteresado) return

        if (body.includes('si')) {
            marriages[id][userPropuesto] = { partner: userInteresado, date: Date.now() }
            marriages[id][userInteresado] = { partner: userPropuesto, date: Date.now() }
            global.db.data.users[userPropuesto].pasaporte = null
            return conn.reply(m.chat, `*🎊 🎉 ¡VIVAN LOS NOVIOS! 🎉 🎊*\n\nEl vínculo ha sido sellado entre *@${userPropuesto.split`@`[0]}* y *@${userInteresado.split`@`[0]}*.`, m, { mentions: [userPropuesto, userInteresado] })
        } else {
            global.db.data.users[userPropuesto].pasaporte = null
            return m.reply(`*💔 Rechazado:* Se ha roto la propuesta.`)
        }
    }

    if (command === 'divorce' || command === 'divorciar') {
        if (!marriages[id][m.sender]) return m.reply('*⚠️ No tienes pareja.*')
        let partner = marriages[id][m.sender].partner
        delete marriages[id][partner]
        delete marriages[id][m.sender]
        return m.reply(`*🌑 Vínculo roto.*`)
    }

    if (command === 'pareja' || command === 'boda') {
        let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender
        let data = marriages[id][who]
        if (!data) return m.reply(`*👤 @${who.split`@`[0]} camina en soledad.*`, null, { mentions: [who] })
        let partner = data.partner
        let statusStr = `*─── [ 📜 𝓔𝓧𝓟𝓔𝓓𝓘𝓔𝓝𝓣𝓔 ] ───*\n\n*👤 Usuario:* @${who.split`@`[0]}\n*💍 Pareja:* @${partner.split`@`[0]}`
        return conn.reply(m.chat, statusStr, m, { mentions: [who, partner] })
    }
}

handler.help = ['marry']
handler.tags = ['fun']
handler.command = ['marry', 'casar', 'divorce', 'divorciar', 'pareja', 'boda']
handler.group = true

export default handler
