import fs from 'fs'

const path = './database/barboza_family.json'
if (!fs.existsSync('./database')) fs.mkdirSync('./database', { recursive: true })
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({}))

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let db = JSON.parse(fs.readFileSync(path))
    const group = m.chat
    if (!db[group]) db[group] = {}
    
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    const sender = m.sender

    // --- FUNCIONES DE APOYO ---
    const save = () => fs.writeFileSync(path, JSON.stringify(db, null, 2))
    const getTarget = (u) => db[group][u] || null
    const getName = (u) => conn.getName(u) || u.split('@')[0]

    try {
        switch (command) {
            case 'marry':
            case 'casar':
                if (!who) return m.reply(`*💍 Propuesta formal:* Etiqueta a alguien para iniciar tu legado.`)
                if (who === sender) return m.reply('*🤨 No puedes casarte contigo mismo.*')
                if (db[group][sender]?.partner) return m.reply(`*⚠️ Ya tienes un vínculo con @${db[group][sender].partner.split('@')[0]}*`, null, { mentions: [db[group][sender].partner] })
                if (db[group][who]?.partner) return m.reply(`*⚠️ Esa persona ya pertenece a otra dinastía.*`)

                let strM = `*💠 𝐁𝐀𝐑𝐁𝐎𝐙𝐀 𝐅𝐀𝐌𝐈𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌 💠*\n\n`
                strM += `*👤 @${getName(sender)}* ha enviado una propuesta a *@${getName(who)}*.\n\n`
                strM += `> ✅ Para aceptar: *${usedPrefix}aceptar @${sender.split('@')[0]}*\n`
                strM += `> ❌ Para rechazar: *${usedPrefix}rechazar @${sender.split('@')[0]}*`
                return conn.reply(group, strM, m, { mentions: [sender, who] })

            case 'aceptar':
                if (!who) return m.reply('*⚠️ Etiqueta a quien te propuso el vínculo.*')
                db[group][sender] = { partner: who, date: Date.now(), hijos: [], mascota: null }
                db[group][who] = { partner: sender, date: Date.now(), hijos: [], mascota: null }
                save()
                return conn.reply(group, `*🎊 ¡VÍNCULO SELLADO! 🎉*\nLa familia de *@${getName(sender)}* y *@${getName(who)}* ha comenzado.`, m, { mentions: [sender, who] })

            case 'pareja':
                let fam = getTarget(sender)
                if (!fam || !fam.partner) return m.reply('*😶 No tienes un vínculo activo.*')
                let diff = Date.now() - fam.date
                let dias = Math.floor(diff / (1000 * 60 * 60 * 24))
                return m.reply(`*❤️ EXPEDIENTE AMOROSO*\n\n*💍 Pareja:* @${getName(fam.partner)}\n*⏳ Tiempo:* ${dias} días de lealtad.\n*✨ Nivel:* ${dias > 30 ? 'Linaje Real' : 'Dinastía Nueva'}`, null, { mentions: [fam.partner] })

            case 'adoptar':
                if (!db[group][sender]?.partner) return m.reply('*⚠️ Primero debes estar casado para formar una familia.*')
                if (!who) return m.reply('*👶 Etiqueta a quien deseas adoptar como hijo/a.*')
                if (who === sender || who === db[group][sender].partner) return m.reply('*🤨 No puedes adoptar a tu pareja o a ti mismo.*')
                
                db[group][sender].hijos.push(who)
                db[group][db[group][sender].partner].hijos.push(who)
                save()
                return m.reply(`*🍼 ¡NUEVO MIEMBRO!* @${getName(who)} ha sido integrado a la familia.`, null, { mentions: [who] })

            case 'adoptar_mascota':
                if (!db[group][sender]?.partner) return m.reply('*⚠️ Solo las familias pueden tener mascotas oficiales.*')
                let tipos = ['perro', 'gato', 'conejo', 'zorro']
                let tipo = text.split(' ')[0].toLowerCase()
                let nombre = text.split(' ').slice(1).join(' ')
                if (!tipos.includes(tipo) || !nombre) return m.reply(`*🐾 Uso:* ${usedPrefix}adoptar_mascota [perro|gato|conejo|zorro] [nombre]`)
                
                let mascota = { tipo, nombre, hambre: 100, animo: 100, lastFed: Date.now() }
                db[group][sender].mascota = mascota
                db[group][db[group][sender].partner].mascota = mascota
                save()
                return m.reply(`*🐾 ¡ADOPCIÓN EXITOSA!* Han adoptado un ${tipo} llamado *${nombre}*. ¡No olviden alimentarlo!`)

            case 'alimentar':
                let f = db[group][sender]
                if (!f || !f.mascota) return m.reply('*⚠️ No tienes una mascota que alimentar.*')
                f.mascota.hambre = 100
                f.mascota.lastFed = Date.now()
                db[group][f.partner].mascota = f.mascota
                save()
                return m.reply(`*🍖 @${getName(sender)} ha alimentado a ${f.mascota.nombre}.* ¡Está muy feliz!`)

            case 'familia':
                let d = getTarget(sender)
                if (!d || !d.partner) return m.reply('*⚠️ No tienes una familia registrada.*')
                let hijosStr = d.hijos.map(h => `  • @${getName(h)}`).join('\n') || '  • Sin hijos'
                let pet = d.mascota ? `*🐾 Mascota:* ${d.mascota.nombre} (${d.mascota.tipo})\n  • *Hambre:* ${d.mascota.hambre}%\n  • *Ánimo:* 100%` : '*🐾 Mascota:* Ninguna'
                
                let res = `*💠 𝐁𝐀𝐑𝐁𝐎𝐙𝐀 𝐅𝐀𝐌𝐈𝐋𝐘 💠*\n\n`
                res += `*💍 Pareja:* @${getName(d.partner)}\n`
                res += `*👨‍👩‍👧‍👦 Hijos:*\n${hijosStr}\n\n${pet}\n\n> Sasuke Bot`
                return conn.reply(group, res, m, { mentions: [sender, d.partner, ...d.hijos] })

            case 'divorce':
            case 'divorciar':
                if (!db[group][sender]?.partner) return m.reply('*⚠️ No hay nada que disolver.*')
                let ex = db[group][sender].partner
                delete db[group][sender]
                delete db[group][ex]
                save()
                return m.reply(`*🌑 Vínculo roto:* La dinastía ha caído. Registros de hijos y mascotas eliminados.`)
        }
    } catch (e) {
        console.log(e)
        m.reply('*⚠️ Error en el sistema Barboza.* Verifica el uso de los comandos.')
    }
}

handler.command = ['marry', 'casar', 'aceptar', 'pareja', 'adoptar', 'adoptar_mascota', 'familia', 'alimentar', 'divorce', 'divorciar']
handler.group = true

export default handler
