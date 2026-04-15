import fs from 'fs'
import path from 'path'

const marriagesFile = path.resolve('media/game/marry_family.json')

function loadDB() {
    if (!fs.existsSync(path.dirname(marriagesFile))) fs.mkdirSync(path.dirname(marriagesFile), { recursive: true })
    return fs.existsSync(marriagesFile) ? JSON.parse(fs.readFileSync(marriagesFile, 'utf8')) : {}
}

function saveDB(data) {
    fs.writeFileSync(marriagesFile, JSON.stringify(data, null, 2))
}

// Global para que la propuesta no se borre al escribir
global.marryConfirm = global.marryConfirm || {}

let handler = async (m, { conn, command, text }) => {
    let db = loadDB()
    const sender = m.sender
    const userIsMarried = (user) => Object.hasOwn(db, user)

    switch (command) {
        case 'marry':
        case 'casar':
            let proposee = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? (text.replace(/[^0-9]/g, '') + '@s.whatsapp.net') : null
            
            if (!proposee || proposee.length < 10) return m.reply('*Etiqueta o responde al mensaje de alguien para proponerle matrimonio.*')
            if (proposee === sender) return m.reply('*No puedes casarte contigo mismo.*')
            if (userIsMarried(sender)) return m.reply(`*Ya posees un vínculo activo.*`)
            if (userIsMarried(proposee)) return m.reply(`*Esa persona ya está en otra dinastía.*`)

            global.marryConfirm[proposee] = {
                proposer: sender,
                timeout: setTimeout(() => {
                    conn.reply(m.chat, `*⌛ Tiempo agotado.* La propuesta de @${sender.split('@')[0]} expiró.`, m, { mentions: [sender] })
                    delete global.marryConfirm[proposee]
                }, 60000)
            }

            const confirmMsg = `*─── [ 💍 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 𝓤𝓘𝓒𝓗𝓘𝓗𝓐 ] ───*\n\n*👤 ${conn.getName(sender)}* le propone matrimonio a *${conn.getName(proposee)}*.\n\n> *Escribe:* "acepto" para confirmar o "rechazo" para cancelar.\n\n*“¿Vienes conmigo a la oscuridad?”*`
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
            
        case 'familia':
            if (!userIsMarried(sender)) return m.reply('No tienes familia.')
            let f = db[sender]
            let fam = `*💠 𝐁𝐀𝐑𝐁𝐎𝐙𝐀 𝐅𝐀𝐌𝐈𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌 💠*\n\n*Padres:* @${sender.split('@')[0]} & @${f.partner.split('@')[0]}\n*Hijos:* ${f.children?.join(', ') || 'Ninguno'}`
            conn.reply(m.chat, fam, m, { mentions: [sender, f.partner] })
            break
    }
}

// --- GESTOR DE RESPUESTAS (ACEPTO / RECHAZO) ---
handler.before = async (m, { conn }) => {
    if (m.isBaileys || !m.text) return
    const txt = m.text.toLowerCase().trim()
    
    // Solo actuamos si el que escribe es el que tiene la propuesta pendiente
    if (global.marryConfirm && global.marryConfirm[m.sender]) {
        const { proposer, timeout } = global.marryConfirm[m.sender]

        if (txt === 'acepto') {
            clearTimeout(timeout)
            let db = loadDB()
            // Guardamos los datos de la Barboza Family
            db[m.sender] = { partner: proposer, date: Date.now(), children: [], pet: null }
            db[proposer] = { partner: m.sender, date: Date.now(), children: [], pet: null }
            saveDB(db)
            delete global.marryConfirm[m.sender]

            await conn.reply(m.chat, `*💍 ¡Vínculo Sellado!* @${proposer.split('@')[0]} y @${m.sender.split('@')[0]} ahora son uno solo.`, m, { mentions: [proposer, m.sender] })
            return true
        }

        if (txt === 'rechazo') {
            clearTimeout(timeout)
            delete global.marryConfirm[m.sender]
            await m.reply(`*💔 Propuesta rechazada.* "No eres lo suficientemente fuerte para estar a mi lado".`)
            return true
        }
    }
}

handler.help = ['marry', 'divorce', 'familia']
handler.tags = ['fun']
handler.command = /^(marry|casar|divorce|divorciar|familia)$/i
handler.group = true

export default handler
