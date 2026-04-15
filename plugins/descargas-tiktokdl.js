import fs from 'fs'
import path from 'path'

const dir = path.resolve('media/game')
const file = path.join(dir, 'marry.json')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const getData = () => {
    try {
        return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : {}
    } catch { return {} }
}
const saveData = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

// Usamos el objeto global para que persista entre ejecuciones del handler
global.marryConfirm = global.marryConfirm || {}

let handler = async (m, { conn, command, text, usedPrefix }) => {
    let db = getData()
    let user = m.sender

    switch (command) {
        case 'marry':
            let target = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null
            if (!target) return m.reply('*🐍 Responde o etiqueta a alguien para casarte.*')
            if (db[user]) return m.reply('*⚠️ Ya tienes un vínculo matrimonial.*')
            if (db[target]) return m.reply('*⚠️ Esa persona ya está casada.*')
            if (target === user) return m.reply('*🤨 No puedes casarte contigo mismo.*')

            // Guardamos la propuesta
            global.marryConfirm[target] = { 
                from: user, 
                time: Date.now() 
            }

            let txtM = `*─── [ 💍 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 ] ───*\n\n`
            txtM += `*👤 @${user.split('@')[0]}* propone matrimonio a *@${target.split('@')[0]}*.\n\n`
            txtM += `> *Escribe:* "acepto" para confirmar.\n`
            txtM += `> *Escribe:* "rechazo" para cancelar.\n\n`
            txtM += `_Tienes 60 segundos._`

            await conn.reply(m.chat, txtM, m, { mentions: [user, target] })
            break

        case 'divorce':
            if (!db[user]) return m.reply('*⚠️ No tienes pareja.*')
            let ex = db[user].partner
            delete db[user]
            delete db[ex]
            saveData(db)
            m.reply('*🌑 El vínculo ha sido disuelto.*')
            break
            
        // ... (puedes mantener los demás comandos amor, familia, etc.)
    }
}

// ESTA ES LA PARTE QUE ARREGLA EL "ACEPTO"
handler.before = async (m, { conn }) => {
    if (!m.text) return false
    let txt = m.text.toLowerCase().trim()
    
    // Verificamos si el que escribe tiene una propuesta pendiente
    if (global.marryConfirm && global.marryConfirm[m.sender]) {
        let conf = global.marryConfirm[m.sender]

        // Si pasó más de 1 minuto, borrar propuesta
        if (Date.now() - conf.time > 60000) {
            delete global.marryConfirm[m.sender]
            return false
        }

        if (txt === 'acepto') {
            let db = getData()
            // Doble check por si se casaron mientras esperaba
            if (db[m.sender] || db[conf.from]) {
                delete global.marryConfirm[m.sender]
                return m.reply('*⚠️ Uno de los dos ya se casó con alguien más.*')
            }

            // Registrar a ambos
            db[m.sender] = { partner: conf.from, date: Date.now() }
            db[conf.from] = { partner: m.sender, date: Date.now() }
            saveData(db)

            await conn.reply(m.chat, `*💍 ¡ACEPTÓ! Felicidades, ahora @${conf.from.split('@')[0]} y @${m.sender.split('@')[0]} están casados.*`, m, { mentions: [conf.from, m.sender] })
            delete global.marryConfirm[m.sender]
            return true
        }

        if (txt === 'rechazo') {
            await m.reply('*❌ Propuesta rechazada.*')
            delete global.marryConfirm[m.sender]
            return true
        }
    }
    return false
}

handler.help = ['marry', 'divorce']
handler.tags = ['fun']
handler.command = /^(marry|divorce|amor|marrylist|familia)$/i
handler.group = true

export default handler
