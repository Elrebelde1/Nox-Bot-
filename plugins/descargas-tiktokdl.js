import fs from 'fs'
import path from 'path'

// Configuración de base de datos
const dir = path.resolve('media/game')
const file = path.join(dir, 'marry.json')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const getData = () => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : {}
const saveData = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

const confirmation = {}
const foodMenu = {
    '🐶': [{ name: 'Croquetas', fill: 20 }, { name: 'Filete', fill: 50 }],
    '🐱': [{ name: 'Atún', fill: 40 }, { name: 'Leche', fill: 20 }],
    '🐰': [{ name: 'Zanahoria', fill: 30 }, { name: 'Heno', fill: 55 }],
    '🦊': [{ name: 'Bayas', fill: 25 }, { name: 'Presa', fill: 50 }]
}

let handler = async (m, { conn, command, text, usedPrefix }) => {
    let db = getData()
    let user = m.sender

    switch (command) {
        case 'marry':
            let target = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null
            if (!target) return m.reply('*🐍 Responde o etiqueta a alguien.*')
            if (db[user]) return m.reply('*⚠️ Ya tienes un vínculo.*')
            if (db[target]) return m.reply('*⚠️ Esa persona ya está casada.*')

            confirmation[target] = { from: user, type: 'marry', time: Date.now() }
            let txtM = `*─── [ 💍 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 ] ───*\n\n*👤 @${user.split('@')[0]}* propone matrimonio a *@${target.split('@')[0]}*.\n\n> Responde: *acepto* o *rechazo*`
            await conn.reply(m.chat, txtM, m, { mentions: [user, target] })
            break

        case 'amor':
            if (!db[user]) return m.reply('*⚠️ No tienes pareja.*')
            let love = Math.floor(Math.random() * 101)
            conn.reply(m.chat, `*❤️ [ 𝓐𝓜𝓞𝓡 ] @${user.split('@')[0]} & @${db[user].partner.split('@')[0]}*\n*Compatibilidad:* ${love}%`, m, { mentions: [user, db[user].partner] })
            break

        case 'marrylist':
            let list = Object.entries(db)
            if (list.length === 0) return m.reply('*❌ Sin parejas.*')
            let txtL = `*─── [ 💍 𝓟𝓐𝓡𝓔𝓙𝓐𝓢 ] ───*\n\n`, p = new Set(), c = 1
            for (let [u, d] of list) {
                if (!p.has(u)) {
                    txtL += `*${c++}.* @${u.split('@')[0]} & @${d.partner.split('@')[0]}\n`
                    p.add(u); p.add(d.partner)
                }
            }
            conn.reply(m.chat, txtL, m, { mentions: Array.from(p) })
            break

        case 'adoptar_mascota':
            if (!db[user]) return m.reply('*⚠️ Solo casados.*')
            let argsP = text.split(' ')
            let icons = { perro: '🐶', gato: '🐱', conejo: '🐰', zorro: '🦊' }
            if (!icons[argsP[0]] || !argsP[1]) return m.reply(`*🐾 Uso:* ${usedPrefix}${command} [perro/gato/zorro] [nombre]`)
            db[user].pet = { type: icons[argsP[0]], name: argsP.slice(1).join(' '), hunger: 50 }
            db[db[user].partner].pet = db[user].pet
            saveData(db)
            m.reply(`*✨ ¡Adoptaron a ${argsP.slice(1).join(' ')} ${icons[argsP[0]]}!*`)
            break

        case 'alimentar':
            if (!db[user]?.pet) return m.reply('*❌ No tienen mascota.*')
            let pet = db[user].pet
            if (pet.hunger >= 100) return m.reply('*✋ Ya está lleno.*')
            let menu = foodMenu[pet.type]
            if (!text) return m.reply(`*🍱 Menú:* ${menu.map((f, i) => `\n${i+1}. ${f.name} (+${f.fill}%)`)}`)
            let fIdx = parseInt(text) - 1
            if (!menu[fIdx]) return m.reply('*❌ Opción inválida.*')
            pet.hunger = Math.min(100, pet.hunger + menu[fIdx].fill)
            db[user].pet = pet; db[db[user].partner].pet = pet
            saveData(db); m.reply(`*🍖 ¡Alimentado! Hambre: ${pet.hunger}%*`)
            break

        case 'familia':
            if (!db[user]) return m.reply('*⚠️ Sin familia.*')
            let d = db[user], h = d.pet ? `\n*Mascota:* ${d.pet.type} ${d.pet.name} (${d.pet.hunger}%)` : ''
            conn.reply(m.chat, `*── [ 👨‍👩‍👧‍👦 𝓕𝓐𝓜𝓘𝓛𝓘𝓐 ] ──*\n*Padres:* @${user.split('@')[0]} & @${d.partner.split('@')[0]}${h}`, m, { mentions: [user, d.partner] })
            break

        case 'divorce':
            if (!db[user]) return m.reply('*⚠️ Sin pareja.*')
            let ex = db[user].partner
            delete db[user]; delete db[ex]
            saveData(db); m.reply('*🌑 El vínculo ha sido disuelto.*')
            break
    }
}

handler.before = async (m, { conn }) => {
    if (!m.text || !confirmation[m.sender]) return
    let db = getData(), input = m.text.toLowerCase().trim(), conf = confirmation[m.sender]
    if (Date.now() - conf.time > 60000) return delete confirmation[m.sender]

    if (input === 'acepto') {
        if (conf.type === 'marry') {
            db[m.sender] = { partner: conf.from, date: Date.now(), children: [], pet: null }
            db[conf.from] = { partner: m.sender, date: Date.now(), children: [], pet: null }
            saveData(db)
            await conn.reply(m.chat, `*💍 ¡Felicidades! @${conf.from.split('@')[0]} y @${m.sender.split('@')[0]} se han casado.*`, m, { mentions: [conf.from, m.sender] })
        }
        delete confirmation[m.sender]
        return true
    }
    if (input === 'rechazo') {
        await m.reply('*❌ Propuesta rechazada.*')
        delete confirmation[m.sender]
        return true
    }
}

handler.help = ['marry', 'amor', 'marrylist', 'adoptar_mascota', 'alimentar', 'familia', 'divorce']
handler.tags = ['fun']
handler.command = /^(marry|amor|marrylist|adoptar_mascota|alimentar|familia|divorce)$/i
handler.group = true

export default handler
