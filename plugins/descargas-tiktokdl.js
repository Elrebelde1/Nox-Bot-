import fs from 'fs'
import path from 'path'

// Base de datos persistente
const dir = path.resolve('media/game')
const file = path.join(dir, 'marry.json')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const getData = () => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : {}
const saveData = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

// Objeto global para las esperas (sobrevive fuera del handler)
global.marryConfirm = global.marryConfirm || {}

let handler = async (m, { conn, command, text, usedPrefix }) => {
    let db = getData()
    let user = m.sender

    // --- SISTEMA DE COMANDOS ---
    switch (command) {
        case 'marry':
            let target = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null
            if (!target) return m.reply('*🐍 Responde o etiqueta a alguien para casarte.*')
            if (db[user]) return m.reply('*⚠️ Ya tienes un vínculo matrimonial.*')
            if (db[target]) return m.reply('*⚠️ Esa persona ya está casada.*')
            if (target === user) return m.reply('*🤨 No puedes casarte contigo mismo.*')

            global.marryConfirm[target] = { 
                from: user, 
                type: 'marry', 
                time: Date.now() 
            }
            
            let txtM = `*─── [ 💍 𝓥𝓘𝓝𝓒𝓤𝓛𝓞 ] ───*\n\n`
            txtM += `*👤 @${user.split('@')[0]}* propone matrimonio a *@${target.split('@')[0]}*.\n\n`
            txtM += `> *Escribe:* "acepto" para confirmar.\n`
            txtM += `> *Escribe:* "rechazo" para cancelar.\n\n`
            txtM += `_Tienes 60 segundos._`
            
            await conn.reply(m.chat, txtM, m, { mentions: [user, target] })
            break

        case 'amor':
            if (!db[user]) return m.reply('*⚠️ No tienes pareja.*')
            let love = Math.floor(Math.random() * 101)
            conn.reply(m.chat, `*❤️ [ 𝓐𝓜𝓞𝓡 ] @${user.split('@')[0]} & @${db[user].partner.split('@')[0]}*\n*Compatibilidad:* ${love}%`, m, { mentions: [user, db[user].partner] })
            break

        case 'marrylist':
            let list = Object.entries(db)
            if (list.length === 0) return m.reply('*❌ No hay parejas registradas.*')
            let txtL = `*─── [ 💍 𝓟𝓐𝓡𝓔𝓙𝓐𝓢 ] ───*\n\n`, p = new Set(), c = 1
            for (let [u, d] of list) {
                if (!p.has(u)) {
                    txtL += `*${c++}.* @${u.split('@')[0]} ♾️ @${d.partner.split('@')[0]}\n`
                    p.add(u); p.add(d.partner)
                }
            }
            conn.reply(m.chat, txtL, m, { mentions: Array.from(p) })
            break

        case 'adoptar_mascota':
            if (!db[user]) return m.reply('*⚠️ Debes estar casado primero.*')
            let argsP = text.split(' ')
            let icons = { perro: '🐶', gato: '🐱', conejo: '🐰', zorro: '🦊' }
            if (!icons[argsP[0]] || !argsP[1]) return m.reply(`*🐾 Uso:* ${usedPrefix}${command} [perro/gato/conejo/zorro] [nombre]`)
            db[user].pet = { type: icons[argsP[0]], name: argsP.slice(1).join(' '), hunger: 50 }
            db[db[user].partner].pet = db[user].pet
            saveData(db)
            m.reply(`*✨ ¡Adoptaron a ${argsP.slice(1).join(' ')} ${icons[argsP[0]]}!*`)
            break

        case 'alimentar':
            if (!db[user]?.pet) return m.reply('*❌ No tienen mascota.*')
            let pet = db[user].pet
            if (pet.hunger >= 100) return m.reply(`*✋ ${pet.name} ya está lleno.*`)
            const food = { '🐶': 'Croquetas', '🐱': 'Atún', '🐰': 'Zanahoria', '🦊': 'Bayas' }
            pet.hunger = Math.min(100, pet.hunger + 25)
            db[user].pet = pet; db[db[user].partner].pet = pet
            saveData(db)
            m.reply(`*🍖 Alimentaste a ${pet.name} con ${food[pet.type] || 'comida'}. Hambre: ${pet.hunger}%*`)
            break

        case 'familia':
            if (!db[user]) return m.reply('*⚠️ No tienes familia.*')
            let d = db[user]
            let res = `*── [ 👨‍👩‍👧‍👦 𝓕𝓐𝓜𝓘𝓛𝓘𝓐 ] ──*\n\n`
            res += `*Padres:* @${user.split('@')[0]} & @${d.partner.split('@')[0]}\n`
            if (d.pet) res += `*Mascota:* ${d.pet.type} ${d.pet.name} (${d.pet.hunger}% hambre)\n`
            res += `*Unión:* ${new Date(d.date).toLocaleDateString()}`
            conn.reply(m.chat, res, m, { mentions: [user, d.partner] })
            break

        case 'divorce':
            if (!db[user]) return m.reply('*⚠️ No tienes pareja.*')
            let ex = db[user].partner
            delete db[user]; delete db[ex]
            saveData(db)
            m.reply('*🌑 El vínculo ha sido disuelto.*')
            break
    }
}

// --- GESTOR DE RESPUESTAS (CORREGIDO) ---
handler.before = async (m, { conn }) => {
    if (!m.text) return
    let db = getData()
    let txt = m.text.toLowerCase().trim()
    
    // Verificar si el usuario tiene una propuesta pendiente en el objeto global
    if (global.marryConfirm && global.marryConfirm[m.sender]) {
        let conf = global.marryConfirm[m.sender]
        
        // Timeout de 60 segundos
        if (Date.now() - conf.time > 60000) {
            delete global.marryConfirm[m.sender]
            return
        }

        if (txt === 'acepto') {
            db[m.sender] = { partner: conf.from, date: Date.now(), children: [], pet: null }
            db[conf.from] = { partner: m.sender, date: Date.now(), children: [], pet: null }
            saveData(db)
            await conn.reply(m.chat, `*💍 ¡Felicidades! @${conf.from.split('@')[0]} y @${m.sender.split('@')[0]} se han casado.*`, m, { mentions: [conf.from, m.sender] })
            delete global.marryConfirm[m.sender]
            return true
        } 
        
        if (txt === 'rechazo') {
            await m.reply('*❌ Propuesta rechazada.*')
            delete global.marryConfirm[m.sender]
            return true
        }
    }
}

handler.help = ['marry', 'amor', 'marrylist', 'adoptar_mascota', 'alimentar', 'familia', 'divorce']
handler.tags = ['fun']
handler.command = /^(marry|amor|marrylist|adoptar_mascota|alimentar|familia|divorce)$/i
handler.group = true

export default handler
