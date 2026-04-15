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
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    const sender = m.sender

    // Función de seguridad para nombres
    const getName = (jid) => conn.getName(jid) || jid.split('@')[0]

    switch (command) {
        case 'marry':
        case 'casar':
            if (!who) return m.reply(`*💍 Propuesta:* Etiqueta a alguien para iniciar tu legado familiar.`)
            if (who === sender) return m.reply('*🤨 No puedes casarte contigo mismo.*')
            if (db[sender]) return m.reply(`*⚠️ Ya tienes un vínculo activo con @${getName(db[sender].partner)}*`, null, { mentions: [db[sender].partner] })
            if (db[who]) return m.reply(`*⚠️ Esa persona ya pertenece a otra dinastía.*`)

            let strM = `*💠 𝐁𝐀𝐑𝐁𝐎𝐙𝐀 𝐅𝐀𝐌𝐈𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌 💠*\n\n`
            strM += `*👤 @${getName(sender)}* solicita unir su destino con *@${getName(who)}*.\n\n`
            strM += `> ✅ Para aceptar: *${usedPrefix}aceptar @${sender.split('@')[0]}*\n`
            strM += `> ❌ Para rechazar: *${usedPrefix}rechazar @${sender.split('@')[0]}*`
            return conn.reply(m.chat, strM, m, { mentions: [sender, who] })

        case 'aceptar':
            if (!who) return m.reply('*⚠️ Etiqueta a quien te propuso matrimonio.*')
            if (db[sender]) return m.reply('*⚠️ Ya estás casado.*')
            
            db[sender] = { partner: who, date: Date.now(), hijos: [], mascota: null }
            db[who] = { partner: sender, date: Date.now(), hijos: [], mascota: null }
            writeDB(db)
            
            return conn.reply(m.chat, `*🎊 ¡VÍNCULO SELLADO! 🎉*\n\nFelicidades a *@${getName(sender)}* y *@${getName(who)}* por fundar su nueva familia.`, m, { mentions: [sender, who] })

        case 'rechazar':
            if (!who) return m.reply('*⚠️ Etiqueta a la persona que vas a rechazar.*')
            let rejStr = `*💔 PROPUESTA RECHAZADA*\n\n*@${getName(sender)}* ha decidido no aceptar el vínculo con *@${getName(who)}*.\n\n> El destino tiene otros planes...`
            return conn.reply(m.chat, rejStr, m, { mentions: [sender, who] })

        case 'pareja':
        case 'boda':
            let user = who || sender
            if (!db[user]) return m.reply(`*👤 @${getName(user)} camina en soledad por ahora.*`, null, { mentions: [user] })
            
            let dataP = db[user]
            let diff = Date.now() - dataP.date
            let dias = Math.floor(diff / (1000 * 60 * 60 * 24))
            
            let pStr = `*❤️ EXPEDIENTE AMOROSO*\n\n`
            pStr += `*💍 Pareja:* @${getName(dataP.partner)}\n`
            pStr += `*⏳ Tiempo:* ${dias} días de unión.\n`
            pStr += `*✨ Estado:* ${dias > 30 ? 'Linaje Real' : 'Dinastía Nueva'}`
            return conn.reply(m.chat, pStr, m, { mentions: [dataP.partner] })

        case 'adoptar':
            if (!db[sender]) return m.reply('*⚠️ Debes estar casado para adoptar.*')
            if (!who) return m.reply('*👶 Etiqueta a quien deseas adoptar.*')
            
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
            return m.reply(`*🍖 Has alimentado a ${db[sender].mascota.nombre}.* ¡Está muy feliz!`)

        case 'familia':
            if (!db[sender]) return m.reply('*⚠️ No tienes una familia registrada.*')
            let d = db[sender]
            let hijos = d.hijos?.map(h => `  • @${getName(h)}`).join('\n') || '  • Sin hijos'
            let petStr = d.mascota ? `*🐾 Mascota:* ${d.mascota.nombre} (${d.mascota.tipo})\n  • *Hambre:* ${d.mascota.hambre}%` : '*🐾 Mascota:* Ninguna'
            
            let fRes = `*💠 𝐁𝐀𝐑𝐁𝐎𝐙𝐀 𝐅𝐀𝐌𝐈𝐋𝐘 💠*\n\n`
            fRes += `*💍 Pareja:* @${getName(d.partner)}\n`
            fRes += `*👨‍👩‍👧‍👦 Hijos:*\n${hijos}\n\n${petStr}\n\n> Sasuke Bot`
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
