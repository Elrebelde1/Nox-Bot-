import fs from 'fs'

const path = './database/marriages.json'
if (!fs.existsSync('./database')) fs.mkdirSync('./database', { recursive: true })
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}))

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let db = JSON.parse(fs.readFileSync(path))
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false

    // --- COMANDO CASAR ---
    if (command === 'marry' || command === 'casar') {
        if (!who) return m.reply(`*💍 [ SASUKE ]* ➔ Etiqueta a tu futuro vínculo.\nUso: ${usedPrefix}${command} @tag`)
        if (who === m.sender) return m.reply('*🤨 No puedes casarte contigo mismo.*')
        if (db[m.sender]) return m.reply(`*⚠️ Ya tienes un vínculo con @${db[m.sender].partner.split('@')[0]}*`, null, { mentions: [db[m.sender].partner] })
        if (db[who]) return m.reply(`*⚠️ Esa persona ya está unida a alguien más.*`)

        let str = `*─── [ 💍 𝓢𝓐𝓢𝓤𝓚𝓔 - 𝓑𝓞𝓓𝓐 ] ───*\n\n`
        str += `*👤 @${m.sender.split('@')[0]}* solicita sellar un destino con *@${who.split('@')[0]}*.\n\n`
        str += `*Para confirmar, @${who.split('@')[0]} debe usar:* \n`
        str += `> ✅ *${usedPrefix}aceptar @${m.sender.split('@')[0]}*\n`
        str += `> ❌ *${usedPrefix}rechazar @${m.sender.split('@')[0]}*`

        return conn.reply(m.chat, str, m, { mentions: [m.sender, who] })
    }

    // --- COMANDO ACEPTAR ---
    if (command === 'aceptar') {
        if (!who) return m.reply(`*⚠️ Etiqueta a quien te propuso el vínculo.*`)
        if (db[m.sender]) return m.reply('*⚠️ Ya estás en un compromiso.*')
        
        let now = Date.now()
        db[m.sender] = { partner: who, date: now }
        db[who] = { partner: m.sender, date: now }
        fs.writeFileSync(path, JSON.stringify(db, null, 2))

        let str = `*🎊 🎉 ¡EL VÍNCULO SE HA SELLADO! 🎉 🎊*\n\n`
        str += `*@${m.sender.split('@')[0]}* y *@${who.split('@')[0]}* ahora son uno solo.\n`
        str += `📅 *Fecha:* ${new Date(now).toLocaleDateString('es-ES')}\n`
        str += `> Sasuke Bot`
        return conn.reply(m.chat, str, m, { mentions: [m.sender, who] })
    }

    // --- COMANDO PAREJA / ESTADO ---
    if (command === 'pareja' || command === 'partner' || command === 'boda') {
        let user = who || m.sender
        if (!db[user]) return m.reply(`*👤 @${user.split('@')[0]} camina en soledad por ahora.*`, null, { mentions: [user] })
        
        let data = db[user]
        let partner = data.partner
        let weddingDate = data.date
        
        let diff = Date.now() - weddingDate
        let days = Math.floor(diff / (1000 * 60 * 60 * 24))
        let hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        let mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

        let timeStr = `${days}d, ${hours}h y ${mins}m`

        let str = `*─── [ 📜 𝓔𝓧𝓟𝓔𝓓𝓘𝓔𝓝𝓣𝓔 𝓐𝓜𝓞𝓡𝓞𝓢𝓞 ] ───*\n\n`
        str += `*👤 Usuario:* @${user.split('@')[0]}\n`
        str += `*💍 Compañero/a:* @${partner.split('@')[0]}\n`
        str += `*🗓️ Sello creado:* ${new Date(weddingDate).toLocaleString('es-ES')}\n`
        str += `*⏳ Tiempo unido:* ${timeStr}\n\n`
        str += `*✨ Estado:* Vínculo Eterno`

        return conn.reply(m.chat, str, m, { mentions: [user, partner] })
    }

    // --- COMANDO MARRYLIST (LISTA DE PAREJAS) ---
    if (command === 'marrylist' || command === 'parejas') {
        let list = Object.keys(db)
        if (list.length === 0) return m.reply('*😶 No hay vínculos registrados en el sistema.*')
        
        let str = `*─── [ 💘 𝓛𝓘𝓢𝓣𝓐 𝓓𝓔 𝓥𝓘𝓝𝓒𝓤𝓛𝓞𝓢 ] ───*\n\n`
        let seen = new Set()
        let count = 1
        
        for (let user of list) {
            if (seen.has(user)) continue
            let data = db[user]
            let partner = data.partner
            
            // Solo mostrar parejas si ambos están en la DB (seguridad)
            if (db[partner]) {
                str += `*${count}.* @${user.split('@')[0]} ❤️ @${partner.split('@')[0]}\n`
                str += `   ╰ *Tiempo:* ${Math.floor((Date.now() - data.date) / (1000 * 60 * 60 * 24))} días juntos\n\n`
                seen.add(user)
                seen.add(partner)
                count++
            }
        }
        
        if (seen.size === 0) return m.reply('*😶 No hay vínculos activos actualmente.*')
        return conn.reply(m.chat, str, m, { mentions: Array.from(seen) })
    }

    // --- COMANDO DIVORCIO ---
    if (command === 'divorce' || command === 'divorciar') {
        if (!db[m.sender]) return m.reply('*⚠️ No tienes ningún contrato que romper.*')
        let ex = db[m.sender].partner
        delete db[m.sender]
        delete db[ex]
        fs.writeFileSync(path, JSON.stringify(db, null, 2))
        return m.reply(`*🌑 Vínculo roto:* Has vuelto a la soledad.`, null, { mentions: [ex] })
    }

    // --- COMANDO RECHAZAR ---
    if (command === 'rechazar') {
        if (!who) return m.reply(`*⚠️ Etiqueta a quien vas a rechazar.*`)
        return conn.reply(m.chat, `*💔 Rechazado:* *@${m.sender.split('@')[0]}* ha rechazado la propuesta.`, m, { mentions: [m.sender, who] })
    }
}

handler.help = ['marry', 'marrylist', 'aceptar', 'divorce', 'pareja']
handler.tags = ['fun']
handler.command = ['marry', 'casar', 'marrylist', 'parejas', 'aceptar', 'rechazar', 'divorce', 'divorciar', 'pareja', 'partner', 'boda']
handler.group = true

export default handler
