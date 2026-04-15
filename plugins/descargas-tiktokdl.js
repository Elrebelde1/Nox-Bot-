import fs from 'fs'
import path from 'path'

const marriagesFile = path.resolve('media/game/marry_family.json')

// --- GESTIÓN DE BASE DE DATOS UNIFICADA ---
function loadDB() {
    if (!fs.existsSync(path.dirname(marriagesFile))) fs.mkdirSync(path.dirname(marriagesFile), { recursive: true })
    return fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {}
}

function saveDB(data) {
    fs.writeFileSync(marriagesFile, JSON.stringify(data, null, 2))
}

// Global para que no se pierda entre ejecuciones
global.marryConfirm = global.marryConfirm || {}

let handler = async (m, { conn, command, text, usedPrefix }) => {
    let db = loadDB()
    const sender = m.sender
    const userIsMarried = (user) => Object.hasOwn(db, user)

    switch (command) {
        case 'marry':
        case 'casar':
            const proposee = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0])
            if (!proposee) return m.reply('*Responde al mensaje de alguien para proponerle matrimonio.*')
            if (proposee === sender) return m.reply('*No puedes casarte contigo mismo.*')
            if (userIsMarried(sender)) return m.reply(`*Ya estás casado con ${conn.getName(db[sender].partner)}.*`)
            if (userIsMarried(proposee)) return m.reply(`*Esa persona ya está casada.*`)

            global.marryConfirm[proposee] = {
                proposer: sender,
                timeout: setTimeout(() => {
                    conn.reply(m.chat, `*⌛ Tiempo agotado.* La propuesta de @${sender.split('@')[0]} expiró.`, m, { mentions: [sender] })
                    delete global.marryConfirm[proposee]
                }, 60000)
            }

            const confirmMsg = `*─── [ 💍 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 𝓤𝓘𝓒𝓗𝓘𝓗𝓐 ] ───*\n\n*👤 ${conn.getName(sender)}* le propone matrimonio a *${conn.getName(proposee)}*.\n\n> *Escribe:* "si" para aceptar o "no" para rechazar.\n\n*“¿Vienes conmigo a la oscuridad?”*`
            await conn.reply(m.chat, confirmMsg, m, { mentions: [sender, proposee] })
            break

        case 'divorce':
        case 'divorciar':
            if (!userIsMarried(sender)) return m.reply('*No tienes pareja.*')
            const partner = db[sender].partner
            delete db[sender]
            delete db[partner]
            saveDB(db)
            await m.reply(`*🌑 El vínculo se ha roto.*`)
            break

        case 'pareja':
        case 'amor':
            if (!userIsMarried(sender)) return m.reply('Caminas solo...')
            let love = Math.floor(Math.random() * 100) + 1
            conn.reply(m.chat, `*❤️ [ VÍNCULO ]*\n*Pareja:* @${db[sender].partner.split('@')[0]}\n*Amor:* ${love}%`, m, { mentions: [db[sender].partner] })
            break

        case 'marrylist':
            let couples = Object.keys(db)
            if (couples.length === 0) return m.reply('*No hay matrimonios.*')
            let list = `*─── [ 💍 𝓥𝓘𝓝𝓒𝓤𝓛𝓞𝓢 ] ───*\n\n`, seen = new Set()
            for (let u of couples) {
                if (!seen.has(u)) {
                    list += `• @${u.split('@')[0]} ♾️ @${db[u].partner.split('@')[0]}\n`
                    seen.add(u); seen.add(db[u].partner)
                }
            }
            conn.reply(m.chat, list, m, { mentions: Array.from(seen) })
            break

        case 'adoptar':
            if (!userIsMarried(sender)) return m.reply('Cásate primero.')
            if (!text) return m.reply(`Uso: ${usedPrefix}adoptar [Nombre]`)
            db[sender].children = db[sender].children || []
            db[sender].children.push(text)
            db[db[sender].partner].children = db[sender].children
            saveDB(db)
            m.reply(`*✨ Adoptaron a "${text}".*`)
            break

        case 'familia':
            if (!userIsMarried(sender)) return m.reply('No tienes familia.')
            let f = db[sender]
            let fam = `*💠 𝐁𝐀𝐑𝐁𝐎𝐙𝐀 𝐅𝐀𝐌𝐈𝐋𝐘 💠*\n\n*Padres:* @${sender.split('@')[0]} & @${f.partner.split('@')[0]}\n*Hijos:* ${f.children?.join(', ') || 'Ninguno'}`
            conn.reply(m.chat, fam, m, { mentions: [sender, f.partner] })
            break
    }
}

// --- GESTOR DE RESPUESTAS (EL QUE SÍ SIRVE) ---
handler.before = async (m, { conn }) => {
    if (m.isBaileys || !m.text) return
    const txt = m.text.toLowerCase().trim()
    
    if (global.marryConfirm && global.marryConfirm[m.sender]) {
        const { proposer, timeout } = global.marryConfirm[m.sender]

        if (txt === 'si' || txt === 'sí' || txt === 'acepto') {
            clearTimeout(timeout)
            let db = loadDB()
            db[m.sender] = { partner: proposer, date: Date.now(), children: [], pet: null }
            db[proposer] = { partner: m.sender, date: Date.now(), children: [], pet: null }
            saveDB(db)
            delete global.marryConfirm[m.sender]

            await conn.reply(m.chat, `*💍 ¡Boda Confirmada!* @${proposer.split('@')[0]} y @${m.sender.split('@')[0]} ahora están casados.`, m, { mentions: [proposer, m.sender] })
            return true
        }

        if (txt === 'no' || txt === 'rechazo') {
            clearTimeout(timeout)
            delete global.marryConfirm[m.sender]
            await m.reply(`*💔 Propuesta rechazada.*`)
            return true
        }
    }
}

handler.help = ['marry', 'divorce', 'pareja', 'amor', 'marrylist', 'adoptar', 'familia']
handler.tags = ['fun']
handler.command = /^(marry|casar|divorce|divorciar|pareja|amor|marrylist|adoptar|familia)$/i
handler.group = true

export default handler
