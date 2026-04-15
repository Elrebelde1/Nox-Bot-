import fs from 'fs'
import path from 'path'

// Base de datos persistente
const dir = path.resolve('media/game')
const file = path.join(dir, 'marry.json')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const getData = () => {
    try {
        return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : {}
    } catch { return {} }
}
const saveData = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

// Objeto global para las esperas
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

            // Registrar propuesta
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
            let petObj = { type: icons[argsP[0]], name: argsP.slice(1).join(' '), hunger: 50 }
            db[user].pet = petObj
            db[db[user].partner].pet = petObj
            saveData(db)
            m.reply(`*✨ ¡Adoptaron a ${petObj.name} ${petObj.type}!*`)
            break

        case 'alimentar':
            if (!db[user]?.pet) return m.reply('*❌ No tienen mascota.*')
            let myPet = db[user].pet
            if (myPet.hunger >= 100) return m.reply(`*✋ ${myPet.name} ya está lleno.*`)
            const food = { '🐶': 'Croquetas', '🐱': 'Atún', '🐰': 'Zanahoria', '🦊': 'Bayas' }
            myPet.hunger = Math.min(100, myPet.hunger + 25)
            db[user].pet = myPet; db[db[user].partner].pet = myPet
            saveData(db)
            m.reply(`*🍖 Alimentaste a ${myPet.name} con ${food[myPet.type] || 'comida'}. Hambre: ${myPet.hunger}%*`)
            break

        case 'familia':
            if (!db[user]) return m.reply('*⚠️ No tienes pareja.*')
            let fam = db[user]
            let res = `*── [ 👨‍👩‍👧‍👦 𝓕𝓐𝓜𝓘𝓛𝓘𝓐 ] ──*\n\n`
            res += `*Padres:* @${user.split('@')[0]} & @${fam.partner.split('@')[0]}\n`
            if (fam.pet) res += `*Mascota:* ${fam.pet.type} ${fam.pet.name} (${fam.pet.hunger}% hambre)\n`
            res += `*Unión:* ${new Date(fam.date).toLocaleDateString()}`
            conn.reply(m.chat, res, m, { mentions: [user, fam.partner] })
            break

        case 'divorce':
            if (!db[user]) return m.reply('*⚠️ No tienes pareja.*')
            let partner = db[user].partner
            delete db[user]
            delete db[partner]
            saveData(db)
            m.reply('*🌑 El vínculo ha sido disuelto. Ambos vuelven a estar solteros.*')
            break
    }
}

// GESTOR DE RESPUESTAS MEJORADO
handler.before = async (m, { conn }) => {
    if (!m.text || !m.chat) return
    let txt = m.text.toLowerCase().trim()
    
    // Si no hay propuesta para este usuario, ignorar
    if (!global.marryConfirm || !global.marryConfirm[m.sender]) return

    let conf = global.marryConfirm[m.sender]

    // Caducidad de 60 segundos
    if (Date.now() - conf.time > 60000) {
        delete global.marryConfirm[m.sender]
        return
    }

    let db = getData()

    if (txt === 'acepto') {
        // Doble verificación por si alguien se casó en el intermedio
        if (db[m.sender] || db[conf.from]) {
            delete global.marryConfirm[m.sender]
            return m.reply('*⚠️ Uno de los dos ya no está disponible.*')
        }

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

handler.help = ['marry', 'amor', 'marrylist', 'adoptar_mascota', 'alimentar', 'familia', 'divorce']
handler.tags = ['fun']
handler.command = /^(marry|amor|marrylist|adoptar_mascota|alimentar|familia|divorce)$/i
handler.group = true

export default handler
