import fs from 'fs'
import path from 'path'

// Conexión a tu base de datos actual
const pathDB = path.resolve('media/game/marry.json') 

function readDB() {
    try {
        if (!fs.existsSync(pathDB)) return {}
        return JSON.parse(fs.readFileSync(pathDB, 'utf-8'))
    } catch { return {} }
}

function writeDB(data) {
    if (!fs.existsSync(path.dirname(pathDB))) fs.mkdirSync(path.dirname(pathDB), { recursive: true })
    fs.writeFileSync(pathDB, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let db = readDB()
    
    // DETECCIÓN MEJORADA: Prioriza el mensaje respondido (quoted)
    let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : false)
    const sender = m.sender

    // Función local blindada contra errores de "null" o "endsWith"
    const getName = (jid) => {
        if (!jid) return 'Usuario'
        try {
            return conn.getName(jid) 
        } catch {
            return jid.split('@')[0]
        }
    }

    switch (command) {
        case 'marry':
        case 'casar':
            // Si no hay 'who', es porque no respondió a nadie ni etiquetó
            if (!who) return m.reply(`*💍 Propuesta:* Responde al mensaje de la persona con la que te quieres casar.`)
            
            if (who === sender) return m.reply('*🤨 No puedes casarte contigo mismo.*')
            
            if (db[sender]) {
                let p = db[sender].partner
                return m.reply(`*⚠️ Ya tienes un vínculo activo con @${getName(p)}*`, null, { mentions: [p] })
            }
            if (db[who]) return m.reply(`*⚠️ Esa persona ya pertenece a otra dinastía.*`)

            let strM = `*💠 𝐁𝐀𝐑𝐁𝐎𝐙𝐀 𝐅𝐀𝐌𝐈𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌 💠*\n\n`
            strM += `*👤 @${getName(sender)}* solicita unir su destino con *@${getName(who)}*.\n\n`
            strM += `> ✅ Para aceptar: *${usedPrefix}aceptar*\n`
            strM += `> ❌ Para rechazar: *${usedPrefix}rechazar*`
            
            // Enviamos con mención para que sea claro
            return conn.reply(m.chat, strM, m, { mentions: [sender, who] })

        case 'aceptar':
            // En aceptar, 'who' debe ser la persona que envió la propuesta (el mensaje citado)
            if (!who) return m.reply('*⚠️ Responde al mensaje de la propuesta para aceptar.*')
            if (db[sender]) return m.reply('*⚠️ Ya estás casado.*')
            if (db[who]) return m.reply('*⚠️ Esa persona ya se casó con alguien más.*')
            
            db[sender] = { partner: who, date: Date.now(), hijos: [], mascota: null }
            db[who] = { partner: sender, date: Date.now(), hijos: [], mascota: null }
            writeDB(db)
            
            return conn.reply(m.chat, `*🎊 ¡VÍNCULO SELLADO! 🎉*\n\nFelicidades a *@${getName(sender)}* y *@${getName(who)}*.`, m, { mentions: [sender, who] })

        case 'rechazar':
            if (!who) return m.reply('*⚠️ Responde al mensaje para rechazar.*')
            return conn.reply(m.chat, `*💔 Propuesta rechazada:* *@${getName(sender)}* ha decidido seguir solo.`, m, { mentions: [sender, who] })

        case 'pareja':
        case 'boda':
            let user = who || sender
            if (!db[user]) return m.reply(`*👤 @${getName(user)} camina en soledad.*`, null, { mentions: [user] })
            
            let dataP = db[user]
            let diff = Date.now() - dataP.date
            let dias = Math.floor(diff / (1000 * 60 * 60 * 24))
            
            return conn.reply(m.chat, `*❤️ EXPEDIENTE AMOROSO*\n\n*💍 Pareja:* @${getName(dataP.partner)}\n*⏳ Tiempo:* ${dias} días.\n*✨ Estado:* Linaje Barboza`, m, { mentions: [dataP.partner] })

        case 'adoptar':
            if (!db[sender]) return m.reply('*⚠️ Debes estar casado para adoptar.*')
            if (!who) return m.reply('*👶 Responde al mensaje de quien quieras adoptar.*')
            if (who === sender || who === db[sender].partner) return m.reply('*🤨 No puedes adoptar a tu pareja.*')
            
            if (!db[sender].hijos) db[sender].hijos = []
            db[sender].hijos.push(who)
            db[db[sender].partner].hijos = db[sender].hijos
            writeDB(db)
            return m.reply(`*🍼 ¡ADOPCIÓN EXITOSA!* @${getName(who)} ahora es parte de la familia.`, null, { mentions: [who] })

        case 'adoptar_mascota':
            if (!db[sender]) return m.reply('*⚠️ Solo familias pueden tener mascotas.*')
            let args = text.split(' ')
            let tipo = args[0]?.toLowerCase()
            let nombrePet = args.slice(1).join(' ')
            if (!['perro', 'gato', 'conejo', 'zorro'].includes(tipo) || !nombrePet) {
                return m.reply(`*🐾 Uso:* ${usedPrefix}adoptar_mascota [perro|gato|conejo|zorro] [nombre]`)
            }
            let mascota = { tipo, nombre: nombrePet, hambre: 100, lastFed: Date.now() }
            db[sender].mascota = mascota
            db[db[sender].partner].mascota = mascota
            writeDB(db)
            return m.reply(`*🐾 ¡BIENVENIDO!* Han adoptado un ${tipo} llamado *${nombrePet}*.`)

        case 'alimentar':
            if (!db[sender]?.mascota) return m.reply('*⚠️ No tienes una mascota familiar.*')
            db[sender].mascota.hambre = 100
            db[sender].mascota.lastFed = Date.now()
            db[db[sender].partner].mascota = db[sender].mascota
            writeDB(db)
            return m.reply(`*🍖 Has alimentado a ${db[sender].mascota.nombre}.*`)

        case 'familia':
            if (!db[sender]) return m.reply('*⚠️ No tienes una familia registrada.*')
            let d = db[sender]
            let hijos = d.hijos?.map(h => `  • @${getName(h)}`).join('\n') || '  • Sin hijos'
            let petStr = d.mascota ? `*🐾 Mascota:* ${d.mascota.nombre} (${d.mascota.tipo})\n  • *Hambre:* ${d.mascota.hambre}%` : '*🐾 Mascota:* Ninguna'
            
            let fRes = `*💠 𝐁𝐀𝐑𝐁𝐎𝐙𝐀 𝐅𝐀𝐌𝐈𝐋𝐘 💠*\n\n*💍 Pareja:* @${getName(d.partner)}\n*👨‍👩‍👧‍👦 Hijos:*\n${hijos}\n\n${petStr}\n\n> Sasuke Bot`
            return conn.reply(m.chat, fRes, m, { mentions: [sender, d.partner, ...(d.hijos || [])] })

        case 'divorce':
        case 'divorciar':
            if (!db[sender]) return m.reply('*⚠️ No tienes un vínculo que disolver.*')
            let ex = db[sender].partner
            delete db[sender]
            delete db[ex]
            writeDB(db)
            return m.reply(`*🌑 Vínculo roto:* El linaje ha sido disuelto.`)
    }
}

handler.command = ['marry', 'casar', 'aceptar', 'rechazar', 'pareja', 'boda', 'adoptar', 'adoptar_mascota', 'familia', 'alimentar', 'divorce', 'divorciar']
handler.group = true

export default handler
