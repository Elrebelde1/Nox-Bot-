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
    let sender = m.sender
    // Detecta al objetivo: Prioridad mensaje respondido > Etiqueta > false
    let who = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : false)

    switch (command) {
        case 'marry':
        case 'casar':
            if (!who) return m.reply(`*💍 Propuesta Barboza:* Responde al mensaje de alguien para proponerle matrimonio.`)
            if (who === sender) return m.reply('*🤨 No puedes casarte contigo mismo.*')
            
            // Verificación segura: Si db[sender] existe y TIENE partner
            if (db[sender] && db[sender].partner) {
                let miPareja = db[sender].partner.split('@')[0]
                return conn.reply(m.chat, `*⚠️ Ya tienes un vínculo activo con:* @${miPareja}`, m, { mentions: [db[sender].partner] })
            }
            if (db[who]) return m.reply(`*⚠️ Esa persona ya pertenece a otra dinastía.*`)

            let strM = `*💠 𝐁𝐀𝐑𝐁𝐎𝐙𝐀 𝐅𝐀𝐌𝐈𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌 💠*\n\n`
            strM += `*👤 @${sender.split('@')[0]}* solicita unir su destino con *@${who.split('@')[0]}*.\n\n`
            strM += `> ✅ Para aceptar responde: *${usedPrefix}aceptar*\n`
            strM += `> ❌ Para rechazar responde: *${usedPrefix}rechazar*`
            return conn.reply(m.chat, strM, m, { mentions: [sender, who] })

        case 'aceptar':
            if (!who) return m.reply('*⚠️ Responde al mensaje de la propuesta para aceptar.*')
            if (db[sender]) return m.reply('*⚠️ Ya estás en un matrimonio.*')
            
            const fechaBoda = Date.now()
            db[sender] = { partner: who, date: fechaBoda, hijos: [], mascota: null }
            db[who] = { partner: sender, date: fechaBoda, hijos: [], mascota: null }
            writeDB(db)
            
            return conn.reply(m.chat, `*🎊 ¡VÍNCULO SELLADO! 🎉*\n\nFelicidades *@${sender.split('@')[0]}* y *@${who.split('@')[0]}*.`, m, { mentions: [sender, who] })

        case 'pareja':
        case 'boda':
            let target = who || sender
            // Validación para evitar el error 'split' de undefined
            if (!db[target] || !db[target].partner) {
                return conn.reply(m.chat, `*👤 @${target.split('@')[0]} aún no tiene pareja.*`, m, { mentions: [target] })
            }
            
            let p = db[target]
            let timeDiff = Date.now() - (p.date || Date.now())
            let dias = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
            
            let msgP = `*❤️ 𝐄𝐗𝐏𝐄𝐃𝐈𝐄𝐍𝐓𝐄 𝐀𝐌𝐎𝐑𝐎𝐒𝐎*\n\n`
            msgP += `*💍 Pareja:* @${p.partner.split('@')[0]}\n`
            msgP += `*⏳ Tiempo:* ${dias} días de unión.\n`
            msgP += `*✨ Estado:* Linaje Barboza`
            return conn.reply(m.chat, msgP, m, { mentions: [p.partner] })

        case 'familia':
            if (!db[sender] || !db[sender].partner) return m.reply('*⚠️ No tienes una familia registrada.*')
            let f = db[sender]
            let hList = f.hijos && f.hijos.length > 0 ? f.hijos.map(h => `  • @${h.split('@')[0]}`).join('\n') : '  • Sin hijos'
            let pet = f.mascota ? `*🐾 Mascota:* ${f.mascota.nombre} (${f.mascota.tipo})` : '*🐾 Mascota:* Ninguna'
            
            let resF = `*💠 𝐁𝐀𝐑𝐁𝐎𝐙𝐀 𝐅𝐀𝐌𝐈𝐋𝐘 💠*\n\n`
            resF += `*💍 Pareja:* @${f.partner.split('@')[0]}\n`
            resF += `*👨‍👩‍👧‍👦 Hijos:*\n${hList}\n\n${pet}\n\n> Sasuke Bot`
            return conn.reply(m.chat, resF, m, { mentions: [sender, f.partner, ...(f.hijos || [])] })

        case 'divorce':
        case 'divorciar':
            if (!db[sender] || !db[sender].partner) return m.reply('*⚠️ No tienes un vínculo que romper.*')
            let ex = db[sender].partner
            delete db[sender]
            delete db[ex]
            writeDB(db)
            return m.reply(`*🌑 Vínculo roto:* El linaje ha sido disuelto.`)

        case 'rechazar':
            if (!who) return m.reply('*⚠️ Responde a la propuesta para rechazarla.*')
            return conn.reply(m.chat, `*💔 @${sender.split('@')[0]} ha rechazado la propuesta de @${who.split('@')[0]}.*`, m, { mentions: [sender, who] })
    }
}

handler.command = ['marry', 'casar', 'aceptar', 'rechazar', 'pareja', 'boda', 'familia', 'divorce', 'divorciar']
handler.group = true

export default handler
