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

global.marryConfirm = global.marryConfirm || {}

let handler = async (m, { conn, command, text }) => {
    let db = loadDB()
    const sender = m.sender
    const userIsMarried = (user) => Object.hasOwn(db, user)

    switch (command) {
        case 'marry':
        case 'casar':
            // Mejora en la detección de la persona a proponer
            let proposee = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? (text.replace(/[^0-9]/g, '') + '@s.whatsapp.net') : null
            
            if (!proposee || proposee.length < 10) return m.reply('*Etiqueta o responde al mensaje de alguien para proponerle matrimonio.*')
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

            // Se usa getName con fallback para evitar el "undefined"
            const nameProposer = conn.getName(sender) || 'Ninja'
            const nameProposee = conn.getName(proposee) || 'Shinobi'

            const confirmMsg = `*─── [ 💍 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 𝓤𝓘𝓒𝓗𝓘𝓗𝓐 ] ───*\n\n*👤 ${nameProposer}* le propone matrimonio a *${nameProposee}*.\n\n> *Escribe:* "si" para aceptar o "no" para rechazar.\n\n*“¿Vienes conmigo a la oscuridad?”*`
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
            
        // ... (otros comandos como pareja, familia, etc)
    }
}

handler.before = async (m, { conn }) => {
    if (m.isBaileys || !m.text) return
    const txt = m.text.toLowerCase().trim()
    
    // Verificamos si hay una propuesta pendiente para el que escribe
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

handler.command = /^(marry|casar|divorce|divorciar|pareja|amor|marrylist|adoptar|familia)$/i
handler.group = true

export default handler
