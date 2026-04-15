import fs from 'fs'
import path from 'path'

const pathDB = path.resolve('media/game/marry.json') 

function readDB() {
    try {
        if (!fs.existsSync(pathDB)) return {}
        const data = fs.readFileSync(pathDB, 'utf-8')
        return data ? JSON.parse(data) : {}
    } catch { return {} }
}

function writeDB(data) {
    if (!fs.existsSync(path.dirname(pathDB))) fs.mkdirSync(path.dirname(pathDB), { recursive: true })
    fs.writeFileSync(pathDB, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let db = readDB()
    
    // Detección ultra-segura del objetivo
    let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : false)
    const sender = m.sender

    // Función para obtener nombre sin fallos de 'undefined' o 'null'
    const getBotName = (jid) => {
        if (!jid) return 'Usuario'
        let res = conn.getName(jid)
        if (!res || res.includes('+')) res = jid.split('@')[0]
        return res
    }

    switch (command) {
        case 'marry':
        case 'casar':
            if (!who) return m.reply(`*💍 Propuesta Barboza:* Responde al mensaje de alguien para proponerle matrimonio.`)
            if (who === sender) return m.reply('*🤨 No puedes casarte contigo mismo.*')
            
            if (db[sender]) return conn.reply(m.chat, `*⚠️ Ya tienes un vínculo activo con:* @${db[sender].partner.split('@')[0]}`, m, { mentions: [db[sender].partner] })
            if (db[who]) return m.reply(`*⚠️ Esa persona ya está casada con alguien más.*`)

            let msgMarry = `*💠 𝐁𝐀𝐑𝐁𝐎𝐙𝐀 𝐅𝐀𝐌𝐈𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌 💠*\n\n`
            msgMarry += `*👤 @${sender.split('@')[0]}* solicita unir su destino con *@${who.split('@')[0]}*.\n\n`
            msgMarry += `> ✅ Para aceptar responde: *${usedPrefix}aceptar*\n`
            msgMarry += `> ❌ Para rechazar responde: *${usedPrefix}rechazar*`
            
            return conn.reply(m.chat, msgMarry, m, { mentions: [sender, who] })

        case 'aceptar':
            if (!who) return m.reply('*⚠️ Responde al mensaje de la propuesta para aceptar.*')
            if (db[sender]) return m.reply('*⚠️ Ya estás en un matrimonio.*')
            
            // Guardamos el timestamp actual para evitar el 'NaN'
            const v_date = Date.now()
            db[sender] = { partner: who, date: v_date, hijos: [], mascota: null }
            db[who] = { partner: sender, date: v_date, hijos: [], mascota: null }
            writeDB(db)
            
            return conn.reply(m.chat, `*🎊 ¡VÍNCULO SELLADO! 🎉*\n\nFelicidades *@${sender.split('@')[0]}* y *@${who.split('@')[0]}*. ¡Su dinastía comienza hoy!`, m, { mentions: [sender, who] })

        case 'pareja':
        case 'boda':
            let target = who || sender
            if (!db[target]) return conn.reply(m.chat, `*👤 @${target.split('@')[0]} aún no ha encontrado su otra mitad.*`, m, { mentions: [target] })
            
            let p_data = db[target]
            let timeDiff = Date.now() - p_data.date
            let p_dias = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
            let p_horas = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            
            let msgP = `*❤️ 𝐄𝐗𝐏𝐄𝐃𝐈𝐄𝐍𝐓𝐄 𝐀𝐌𝐎𝐑𝐎𝐒𝐎*\n\n`
            msgP += `*💍 Pareja:* @${p_data.partner.split('@')[0]}\n`
            msgP += `*⏳ Tiempo:* ${p_dias} días y ${p_horas} horas.\n`
            msgP += `*✨ Estado:* Linaje Barboza`
            return conn.reply(m.chat, msgP, m, { mentions: [p_data.partner] })

        case 'familia':
            if (!db[sender]) return m.reply('*⚠️ No tienes una familia registrada.*')
            let f = db[sender]
            let listH = f.hijos?.map(h => `  • @${h.split('@')[0]}`).join('\n') || '  • Sin hijos'
            let petInfo = f.mascota ? `*🐾 Mascota:* ${f.mascota.nombre} (${f.mascota.tipo})\n  • *Hambre:* ${f.mascota.hambre}%` : '*🐾 Mascota:* Ninguna'
            
            let resF = `*💠 𝐁𝐀𝐑𝐁𝐎𝐙𝐀 𝐅𝐀𝐌𝐈𝐋𝐘 💠*\n\n`
            resF += `*💍 Pareja:* @${f.partner.split('@')[0]}\n`
            resF += `*👨‍👩‍👧‍👦 Hijos:*\n${listH}\n\n${petInfo}\n\n> Sasuke Bot`
            return conn.reply(m.chat, resF, m, { mentions: [sender, f.partner, ...(f.hijos || [])] })

        case 'divorce':
        case 'divorciar':
            if (!db[sender]) return m.reply('*⚠️ No tienes un vínculo que romper.*')
            let exPartner = db[sender].partner
            delete db[sender]
            delete db[exPartner]
            writeDB(db)
            return m.reply(`*🌑 Vínculo roto:* El linaje ha sido disuelto.`)

        case 'rechazar':
            if (!who) return m.reply('*⚠️ Responde a la propuesta para rechazarla.*')
            return conn.reply(m.chat, `*💔 @${sender.split('@')[0]} ha rechazado la propuesta de @${who.split('@')[0]}.*`, m, { mentions: [sender, who] })
            
        case 'adoptar':
            if (!db[sender]) return m.reply('*⚠️ Debes estar casado para adoptar.*')
            if (!who) return m.reply('*👶 Responde a quien quieras adoptar.*')
            if (!db[sender].hijos) db[sender].hijos = []
            db[sender].hijos.push(who)
            db[db[sender].partner].hijos = db[sender].hijos
            writeDB(db)
            return m.reply(`*🍼 ¡Adoptado!* @${who.split('@')[0]} ahora es parte de su familia.`, null, { mentions: [who] })

        case 'adoptar_mascota':
            if (!db[sender]) return m.reply('*⚠️ Solo familias pueden tener mascotas.*')
            let [tipoP, ...nomP] = text.split(' ')
            let nPet = nomP.join(' ')
            if (!['perro', 'gato', 'zorro'].includes(tipoP) || !nPet) return m.reply(`*🐾 Uso:* ${usedPrefix}adoptar_mascota [perro|gato|zorro] [nombre]`)
            db[sender].mascota = { tipo: tipoP, nombre: nPet, hambre: 100 }
            db[db[sender].partner].mascota = db[sender].mascota
            writeDB(db)
            return m.reply(`*🐾 Han adoptado un ${tipoP} llamado ${nPet}!*`)
    }
}

handler.command = ['marry', 'casar', 'aceptar', 'rechazar', 'pareja', 'boda', 'adoptar', 'adoptar_mascota', 'familia', 'divorce', 'divorciar']
handler.group = true

export default handler
