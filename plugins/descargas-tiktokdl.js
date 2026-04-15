let marriages = {} 

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const id = m.chat
    if (!marriages[id]) marriages[id] = {}

    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false

    // Comandos de matrimonio
    if (command === 'marry' || command === 'casar') {
        if (marriages[id][m.sender]) {
            let p = marriages[id][m.sender].partner
            return m.reply(`*⚠️ Ya tienes un compromiso activo con @${p.split`@`[0]}*`, null, { mentions: [p] })
        }
        
        if (!who) return m.reply(`*🐍 [ ERROR ] ➔ Etiqueta a alguien para sellar tu destino.*`)
        if (who === m.sender) return m.reply('*🤨 No puedes casarte contigo mismo.*')
        if (marriages[id][who]) return m.reply('*⚠️ Esa persona ya está en un compromiso.*')

        let str = `*─── [ 💍 𝓢𝓐𝓢𝓤𝓚𝓔 - 𝓑𝓞𝓓𝓐 ] ───*\n\n*👤 @${m.sender.split`@`[0]}* solicita un vínculo con *@${who.split`@`[0]}*.\n\n*¿Aceptas?*\n\n> *⚠️ RESPONDE a este mensaje con "Acepto" o "Rechazo".*`
        
        let weddingMsg = await conn.reply(m.chat, str, m, { mentions: [m.sender, who] })

        try {
            let response = await new Promise((resolve, reject) => {
                let timeout = setTimeout(() => {
                    conn.ev.off('messages.upsert', handlerMsg)
                    reject(new Error('timeout'))
                }, 60000)

                let handlerMsg = async ({ messages }) => {
                    let msg = messages[0]
                    if (!msg.message || msg.key.remoteJid !== id || (msg.key.participant || msg.participant) !== who) return
                    
                    // Extraer el texto de cualquier tipo de mensaje (normal o con formato)
                    let txt = (msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.buttonsResponseMessage?.selectedButtonId || '').trim().toLowerCase()
                    
                    // Verificar si es respuesta al mensaje de la boda
                    let cited = msg.message.extendedTextMessage?.contextInfo?.stanzaId
                    if (cited !== weddingMsg.key.id) return

                    if (txt === 'acepto' || txt === 'rechazo') {
                        clearTimeout(timeout)
                        conn.ev.off('messages.upsert', handlerMsg)
                        resolve(txt)
                    }
                }
                conn.ev.on('messages.upsert', handlerMsg)
            })

            if (response === 'acepto') {
                marriages[id][m.sender] = { partner: who, date: Date.now(), status: 'Vínculo Eterno' }
                marriages[id][who] = { partner: m.sender, date: Date.now(), status: 'Vínculo Eterno' }
                return conn.reply(m.chat, `*🎊 🎉 ¡EL VÍNCULO SE HA SELLADO! 🎉 🎊*\n\n*@${m.sender.split`@`[0]}* y *@${who.split`@`[0]}* ahora están unidos.`, m, { mentions: [m.sender, who] })
            } else {
                return m.reply(`*💔 Rechazado:* *@${who.split`@`[0]}* prefirió la libertad.`, null, { mentions: [who] })
            }
        } catch (e) {
            return m.reply('*⏰ Tiempo agotado:* El destino no esperó.')
        }
    }

    // Comando divorcio
    if (command === 'divorce' || command === 'divorciar') {
        if (!marriages[id][m.sender]) return m.reply('*⚠️ No tienes ningún vínculo que romper.*')
        let partner = marriages[id][m.sender].partner
        delete marriages[id][partner]
        delete marriages[id][m.sender]
        return m.reply(`*🌑 Vínculo roto:* El contrato ha terminado.`)
    }

    // Información de pareja
    if (command === 'pareja' || command === 'boda') {
        let target = who || m.sender
        let data = marriages[id][target]
        if (!data) return m.reply(`*👤 @${target.split`@`[0]} camina en soledad.*`, null, { mentions: [target] })
        let partner = data.partner
        let statusStr = `*─── [ 📜 𝓔𝓧𝓟𝓔𝓓𝓘𝓔𝓝𝓣𝓔 ] ───*\n\n*👤 Usuario:* @${target.split`@`[0]}\n*💍 Pareja:* @${partner.split`@`[0]}\n*✨ Estado:* ${data.status}`
        return conn.reply(m.chat, statusStr, m, { mentions: [target, partner] })
    }

    // Lista de parejas
    if (command === 'parejas') {
        let list = Object.keys(marriages[id])
        if (list.length === 0) return m.reply('*😶 No hay vínculos registrados.*')
        let listStr = `*─── [ 💘 𝓥𝓘𝓝𝓒𝓤𝓛𝓞𝓢 ] ───*\n\n`
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
