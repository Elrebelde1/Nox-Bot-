import fs from 'fs'
import path from 'path'

// Configuración de base de datos
const dir = path.resolve('media/game')
const file = path.join(dir, 'marry.json')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const getData = () => {
    try {
        return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : {}
    } catch { return {} }
}
const saveData = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

// Objeto para propuestas temporales
global.marryConfirm = global.marryConfirm || {}

let handler = async (m, { conn, command, text, usedPrefix }) => {
    let db = getData()
    let user = m.sender

    switch (command) {
        case 'marry':
            let target = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : null
            if (!target) return m.reply('*💍 Etiqueta o responde al mensaje de alguien para proponerle matrimonio.*')
            if (db[user]) return m.reply('*⚠️ Tú ya estás en un vínculo.*')
            if (db[target]) return m.reply('*⚠️ Esa persona ya está casada.*')
            if (target === user) return m.reply('*🤨 No puedes casarte contigo mismo.*')

            global.marryConfirm[target] = { from: user, time: Date.now() }

            let txtM = `*─── [ 💍 𝓟𝓡𝓞𝓟𝓤𝓔𝓢𝓣𝓐 ] ───*\n\n`
            txtM += `*👤 @${user.split('@')[0]}* le ha pedido matrimonio a *@${target.split('@')[0]}*.\n\n`
            txtM += `> *Escribe:* "acepto" para unir sus vidas.\n`
            txtM += `> *Escribe:* "rechazo" para romper su corazón.\n\n`
            txtM += `_Caduca en 60 segundos._`

            await conn.reply(m.chat, txtM, m, { mentions: [user, target] })
            break

        case 'amor':
            if (!db[user]) return m.reply('*⚠️ No tienes pareja.*')
            let love = Math.floor(Math.random() * 100) + 1
            let heart = love > 70 ? '💖' : love > 40 ? '🧡' : '💔'
            conn.reply(m.chat, `*${heart} [ 𝓒𝓞𝓜𝓟𝓐𝓣𝓘𝓑𝓘𝓛𝓘𝓓𝓐𝓓 ]*\n\n*Pareja:* @${user.split('@')[0]} & @${db[user].partner.split('@')[0]}\n*Nivel de amor:* ${love}%`, m, { mentions: [user, db[user].partner] })
            break

        case 'marrylist':
            let list = Object.entries(db)
            if (list.length === 0) return m.reply('*❌ No hay matrimonios registrados.*')
            let txtL = `*─── [ 💍 𝓛𝓘𝓢𝓣𝓐 𝓓𝓔 𝓑𝓞𝓓𝓐𝓢 ] ───*\n\n`, visto = new Set()
            let count = 1
            for (let [u, d] of list) {
                if (!visto.has(u)) {
                    txtL += `*${count++}.* @${u.split('@')[0]} ♾️ @${d.partner.split('@')[0]}\n`
                    visto.add(u); visto.add(d.partner)
                }
            }
            conn.reply(m.chat, txtL, m, { mentions: Array.from(visto) })
            break

        case 'adoptar_mascota':
            if (!db[user]) return m.reply('*⚠️ Necesitas estar casado para tener una mascota familiar.*')
            let args = text.split(' ')
            let tipos = { perro: '🐶', gato: '🐱', conejo: '🐰', zorro: '🦊' }
            let tipo = args[0]?.toLowerCase()
            let nombre = args.slice(1).join(' ')
            if (!tipos[tipo] || !nombre) return m.reply(`*🐾 Uso:* ${usedPrefix}${command} [perro/gato/conejo/zorro] [nombre]`)
            
            let nuevaMascota = { type: tipos[tipo], name: nombre, hunger: 50 }
            db[user].pet = nuevaMascota
            db[db[user].partner].pet = nuevaMascota
            saveData(db)
            m.reply(`*✨ ¡Felicidades! Han adoptado a ${nombre} ${tipos[tipo]}.*`)
            break

        case 'alimentar':
            if (!db[user]?.pet) return m.reply('*❌ No tienen una mascota que alimentar.*')
            if (db[user].pet.hunger >= 100) return m.reply(`*✋ ${db[user].pet.name} ya está satisfecho.*`)
            
            db[user].pet.hunger = Math.min(100, db[user].pet.hunger + 20)
            db[db[user].partner].pet = db[user].pet // Sincronizar con pareja
            saveData(db)
            m.reply(`*🍖 Alimentaste a ${db[user].pet.name}. Hambre: ${db[user].pet.hunger}%*`)
            break

        case 'familia':
            if (!db[user]) return m.reply('*⚠️ No tienes una familia formada.*')
            let f = db[user]
            let famMsg = `*─── [ 👨‍👩‍👧‍👦 𝓣𝓤 𝓕𝓐𝓜𝓘𝓛𝓘𝓐 ] ───*\n\n`
            famMsg += `*Esposos:* @${user.split('@')[0]} & @${f.partner.split('@')[0]}\n`
            if (f.pet) famMsg += `*Mascota:* ${f.pet.name} ${f.pet.type} (Hambre: ${f.pet.hunger}%)\n`
            famMsg += `*Fecha de unión:* ${new Date(f.date).toLocaleDateString()}`
            conn.reply(m.chat, famMsg, m, { mentions: [user, f.partner] })
            break

        case 'divorce':
            if (!db[user]) return m.reply('*⚠️ No tienes a nadie de quien divorciarte.*')
            let exPartner = db[user].partner
            delete db[user]
            delete db[exPartner]
            saveData(db)
            m.reply('*🌑 El matrimonio ha sido anulado. Ambos son libres ahora.*')
            break
    }
}

// GESTOR DE RESPUESTAS (CORREGIDO PARA TODOS LOS CASOS)
handler.before = async (m, { conn }) => {
    if (!m.text || !m.chat || m.fromMe) return false
    let txt = m.text.toLowerCase().trim()
    
    // Si el usuario que escribe tiene una propuesta pendiente
    if (global.marryConfirm && global.marryConfirm[m.sender]) {
        let propuesta = global.marryConfirm[m.sender]

        // Verificar tiempo (1 minuto)
        if (Date.now() - propuesta.time > 60000) {
            delete global.marryConfirm[m.sender]
            return false
        }

        if (txt === 'acepto') {
            let db = getData()
            // Verificar que el proponente no se haya casado con otro en ese minuto
            if (db[propuesta.from] || db[m.sender]) {
                delete global.marryConfirm[m.sender]
                return m.reply('*⚠️ Uno de los dos ya no está disponible.*')
            }

            // Registrar matrimonio para ambos
            let datos = { partner: propuesta.from, date: Date.now(), pet: null }
            db[m.sender] = datos
            db[propuesta.from] = { partner: m.sender, date: Date.now(), pet: null }
            
            saveData(db)
            await conn.reply(m.chat, `*💍 ¡Vivan los novios! @${propuesta.from.split('@')[0]} y @${m.sender.split('@')[0]} se han casado.*`, m, { mentions: [propuesta.from, m.sender] })
            delete global.marryConfirm[m.sender]
            return true
        }

        if (txt === 'rechazo') {
            delete global.marryConfirm[m.sender]
            await m.reply('*💔 La propuesta fue rechazada crudamente.*')
            return true
        }
    }
    return false
}

handler.help = ['marry', 'amor', 'marrylist', 'adoptar_mascota', 'alimentar', 'familia', 'divorce']
handler.tags = ['fun']
handler.command = /^(marry|amor|marrylist|adoptar_mascota|alimentar|familia|divorce)$/i
handler.group = true

export default handler
