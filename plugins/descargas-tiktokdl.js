import fs from 'fs'
import path from 'path'

// Configuración de persistencia
const dir = path.resolve('media/game')
const file = path.join(dir, 'marry_v2.json')
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

const getDB = () => {
    try {
        return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : {}
    } catch { return {} }
}
const saveDB = (data) => fs.writeFileSync(file, JSON.stringify(data, null, 2))

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let db = getDB()
    const id = m.chat
    if (!db[id]) db[id] = {}

    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false

    // --- COMANDO CASAR ---
    if (command === 'marry' || command === 'casar') {
        if (!who) return m.reply(`*💍 [ ERROR ]* ➔ Etiqueta o responde a alguien para proponerle matrimonio.`)
        if (who === m.sender) return m.reply('*🤨 No puedes casarte contigo mismo.*')
        if (db[id][m.sender]) return m.reply('*⚠️ Ya tienes un compromiso. Usa .divorce para liberarte.*')
        if (db[id][who]) return m.reply('*⚠️ Esa persona ya está casada.*')

        let str = `*─── [ 💍 𝓢𝓐𝓢𝓤𝓚𝓔 - 𝓑𝓞𝓓𝓐 ] ───*\n\n*👤 @${m.sender.split`@`[0]}* solicita un vínculo con *@${who.split`@`[0]}*.\n\n> *⚠️ TIENE 60 SEG:* Responde a este mensaje con *"Si"* o *"No"* para decidir tu destino.`
        
        let weddingMsg = await conn.reply(m.chat, str, m, { mentions: [m.sender, who] })

        try {
            let response = await new Promise((resolve, reject) => {
                let timeout = setTimeout(() => {
                    conn.ev.off('messages.upsert', handlerMsg)
                    reject(new Error('timeout'))
                }, 60000)

                let handlerMsg = async ({ messages }) => {
                    let msg = messages[0]
                    if (!msg.message || msg.key.remoteJid !== id || msg.key.participant !== who) return
                    
                    // Verificamos que responda al mensaje de la boda
                    let cited = msg.message.extendedTextMessage?.contextInfo?.stanzaId
                    if (cited !== weddingMsg.key.id) return

                    let body = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim().toLowerCase()

                    if (/^(si|sí|no)$/i.test(body)) {
                        clearTimeout(timeout)
                        conn.ev.off('messages.upsert', handlerMsg)
                        resolve(body.includes('si') ? 'si' : 'no')
                    }
                }
                conn.ev.on('messages.upsert', handlerMsg)
            })

            if (response === 'si') {
                db = getDB() // Recargar para evitar conflictos
                db[id][m.sender] = { partner: who, date: Date.now(), status: 'Vínculo Eterno', pet: null }
                db[id][who] = { partner: m.sender, date: Date.now(), status: 'Vínculo Eterno', pet: null }
                saveDB(db)
                return conn.reply(m.chat, `*🎊 🎉 ¡EL VÍNCULO SE HA SELLADO! 🎉 🎊*\n\n*@${m.sender.split`@`[0]}* y *@${who.split`@`[0]}* ahora son esposos ante este grupo.`, m, { mentions: [m.sender, who] })
            } else {
                return m.reply(`*💔 RECHAZADO:* *@${who.split`@`[0]}* ha decidido ignorar tu propuesta.`)
            }
        } catch (e) {
            return m.reply('*⏰ TIEMPO AGOTADO:* El destino no esperó más.')
        }
    }

    // --- COMANDO DIVORCIO ---
    if (command === 'divorce' || command === 'divorciar') {
        if (!db[id][m.sender]) return m.reply('*⚠️ No estás en ningún vínculo.*')
        let partner = db[id][m.sender].partner
        delete db[id][partner]
        delete db[id][m.sender]
        saveDB(db)
        return m.reply(`*🌑 VÍNCULO ROTO:* El contrato ha terminado. Ambos vuelven a la soledad.`)
    }

    // --- COMANDO PAREJA / BODA (PERFIL) ---
    if (command === 'pareja' || command === 'boda') {
        let target = who || m.sender
        let data = db[id][target]
        if (!data) return m.reply(`*👤 @${target.split`@`[0]} está soltero/a.*`, null, { mentions: [target] })
        
        let date = new Date(data.date).toLocaleDateString('es-ES')
        let res = `*─── [ 💍 𝓔𝓧𝓟𝓔𝓓𝓘𝓔𝓝𝓣𝓔 ] ───*\n\n`
        res += `*👤 Usuario:* @${target.split`@`[0]}\n`
        res += `*💍 Pareja:* @${data.partner.split`@`[0]}\n`
        res += `*🗓️ Fecha:* ${date}\n`
        if (data.pet) res += `*🐾 Mascota:* ${data.pet.name} (${data.pet.type})\n`
        res += `*✨ Estado:* ${data.status}`
        return conn.reply(m.chat, res, m, { mentions: [target, data.partner] })
    }

    // --- COMANDO PAREJAS (LISTA) ---
    if (command === 'parejas') {
        let list = Object.keys(db[id])
        if (list.length === 0) return m.reply('*😶 No hay matrimonios aquí.*')
        let listStr = `*─── [ 💘 𝓥𝓘𝓝𝓒𝓤𝓛𝓞𝓢 𝓓𝓔𝓛 𝓖𝓡𝓤𝓟𝓞 ] ───*\n\n`
        let seen = new Set()
        let c = 1
        for (let user of list) {
            if (seen.has(user)) continue
            let partner = db[id][user].partner
            listStr += `*${c++}. @${user.split`@`[0]}* ∞ *@${partner.split`@`[0]}*\n`
            seen.add(user); seen.add(partner)
        }
        return conn.reply(m.chat, listStr, m, { mentions: Array.from(seen) })
    }

    // --- COMANDO MASCOTA ---
    if (command === 'adoptar') {
        if (!db[id][m.sender]) return m.reply('*⚠️ Primero debes estar casado.*')
        let args = text.split(' ')
        if (!args[0] || !args[1]) return m.reply(`*🐾 Uso:* .adoptar [perro/gato] [nombre]`)
        
        let mascota = { type: args[0], name: args.slice(1).join(' ') }
        db[id][m.sender].pet = mascota
        db[id][db[id][m.sender].partner].pet = mascota
        saveDB(db)
        m.reply(`*✨ Adoptaron a ${mascota.name}!*`)
    }
}

handler.help = ['marry', 'divorce', 'pareja', 'parejas', 'adoptar']
handler.tags = ['fun']
handler.command = ['marry', 'casar', 'divorce', 'divorciar', 'pareja', 'boda', 'parejas', 'adoptar']
handler.group = true

export default handler
