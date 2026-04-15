import fs from 'fs'

// Ruta de guardado persistente
const path = './database/marriages.json'
if (!fs.existsSync('./database')) fs.mkdirSync('./database', { recursive: true })
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}))

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let db = JSON.parse(fs.readFileSync(path))
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false

    // 1. COMANDO PARA PROPONER (.marry @user)
    if (command === 'marry' || command === 'casar') {
        if (!who) return m.reply(`*💍 [ SASUKE BOT ]* ➔ Etiqueta a alguien.\nUso: ${usedPrefix}${command} @tag`)
        if (who === m.sender) return m.reply('*🤨 No puedes casarte contigo mismo.*')
        if (db[m.sender]) return m.reply(`*⚠️ Ya estás casado con @${db[m.sender].split('@')[0]}*`, null, { mentions: [db[m.sender]] })
        if (db[who]) return m.reply(`*⚠️ Esa persona ya está casada con alguien más.*`)

        let str = `*─── [ 💍 𝓢𝓐𝓢𝓤𝓚𝓔 - 𝓑𝓞𝓓𝓐 ] ───*\n\n`
        str += `*👤 @${m.sender.split('@')[0]}* le ha propuesto matrimonio a *@${who.split('@')[0]}*.\n\n`
        str += `*Para responder, @${who.split('@')[0]} debe usar:* \n`
        str += `> ✅ *${usedPrefix}aceptar @${m.sender.split('@')[0]}*\n`
        str += `> ❌ *${usedPrefix}rechazar @${m.sender.split('@')[0]}*`

        return conn.reply(m.chat, str, m, { mentions: [m.sender, who] })
    }

    // 2. COMANDO PARA ACEPTAR (.aceptar @user)
    if (command === 'aceptar') {
        if (!who) return m.reply(`*⚠️ Debes etiquetar a la persona cuya propuesta aceptas.*`)
        if (db[m.sender]) return m.reply('*⚠️ Ya estás casado.*')
        if (db[who]) return m.reply('*⚠️ Esa persona ya se casó con alguien más.*')

        // Guardar en "Base de Datos"
        db[m.sender] = who
        db[who] = m.sender
        fs.writeFileSync(path, JSON.stringify(db, null, 2))

        let str = `*🎊 🎉 ¡EL VÍNCULO SE HA SELLADO! 🎉 🎊*\n\n`
        str += `*@${m.sender.split('@')[0]}* y *@${who.split('@')[0]}* ahora están unidos eternamente.\n\n`
        str += `> Sasuke Bot`
        return conn.reply(m.chat, str, m, { mentions: [m.sender, who] })
    }

    // 3. COMANDO PARA RECHAZAR (.rechazar @user)
    if (command === 'rechazar') {
        if (!who) return m.reply(`*⚠️ Etiqueta a quien vas a rechazar.*`)
        return conn.reply(m.chat, `*💔 Rechazado:* *@${m.sender.split('@')[0]}* ha mandado a la fila de espera a *@${who.split('@')[0]}*.`, m, { mentions: [m.sender, who] })
    }

    // 4. COMANDO PARA DIVORCIO
    if (command === 'divorce' || command === 'divorciar') {
        if (!db[m.sender]) return m.reply('*⚠️ No tienes a quién dejar.*')
        let ex = db[m.sender]
        delete db[m.sender]
        delete db[ex]
        fs.writeFileSync(path, JSON.stringify(db, null, 2))
        return m.reply(`*🌑 Vínculo roto:* Has vuelto a la soledad.`)
    }

    // 5. VER ESTADO (.pareja)
    if (command === 'pareja' || command === 'partner') {
        let user = who || m.sender
        if (!db[user]) return m.reply(`*👤 @${user.split('@')[0]} no tiene pareja.*`, null, { mentions: [user] })
        let miPareja = db[user]
        return conn.reply(m.chat, `*💍 Pareja de @${user.split('@')[0]}:* @${miPareja.split('@')[0]}`, m, { mentions: [user, miPareja] })
    }
}

handler.help = ['marry', 'aceptar', 'rechazar', 'divorce', 'pareja']
handler.tags = ['fun']
handler.command = ['marry', 'casar', 'aceptar', 'rechazar', 'divorce', 'divorciar', 'pareja', 'partner']
handler.group = true

export default handler
