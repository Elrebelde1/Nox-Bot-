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

let handler = async (m, { conn, command, text, usedPrefix }) => {
    let db = loadDB()
    const sender = m.sender

    switch (command) {
        case 'marry':
            const proposee = m.quoted?.sender || (m.mentionedJid && m.mentionedJid[0])
            if (!proposee) return m.reply('💠 *Responde o etiqueta a alguien para proponerle matrimonio.*')
            if (proposee === sender) return m.reply('Hmp... No puedes casarte contigo mismo.')
            if (db[sender]) return m.reply(`Ya tienes un vínculo activo con *${conn.getName(db[sender].partner)}*.`)
            if (db[proposee]) return m.reply('Esa persona ya pertenece a otra dinastía.')

            const msgMarry = `*─── [ 💍 𝓢𝓐𝓢𝓤𝓓𝓞-𝓑𝓞𝓓𝓐 ] ───*\n\n*👤 @${sender.split('@')[0]}* propone matrimonio a *@${proposee.split('@')[0]}*.\n\n> *Responde a este mensaje con:* "si" o "no".\n\n_Tienes 60 segundos._`
            const weddingMsg = await conn.reply(m.chat, msgMarry, m, { mentions: [sender, proposee] })

            // --- RECOLECTOR DE RESPUESTA (Sustituye al before) ---
            const filter = (msg) => msg.sender === proposee && /^(si|sí|no|acepto|rechazo)$/i.test(msg.text) && msg.quoted && msg.quoted.id === weddingMsg.id
            
            try {
                const response = await conn.waitEvent('messages.upsert', filter, 60000)
                const txt = response.messages[0].text.toLowerCase().trim()

                if (txt.includes('si') || txt.includes('acepto')) {
                    db = loadDB() // Recargar para evitar sobreescritura
                    db[sender] = { partner: proposee, date: Date.now(), children: [], pet: null }
                    db[proposee] = { partner: sender, date: Date.now(), children: [], pet: null }
                    saveDB(db)
                    return conn.reply(m.chat, `*── [ 💍 𝓑𝓞𝓓𝓐 𝓒𝓞𝓝𝓕𝓘𝓡𝓜𝓐𝓓𝓐 ] ──*\n\n*¡Vivan los novios! @${sender.split('@')[0]} y @${proposee.split('@')[0]} han sellado su destino.*`, m, { mentions: [sender, proposee] })
                } else {
                    return m.reply('*💔 Propuesta rechazada.* "No eres lo suficientemente fuerte para estar a mi lado".')
                }
            } catch (e) {
                return m.reply('*⌛ El tiempo se ha agotado.* La propuesta se desvaneció en las sombras.')
            }
            break

        case 'divorce':
            if (!db[sender]) return m.reply('No tienes ningún vínculo que romper.')
            const ex = db[sender].partner
            delete db[sender]
            delete db[ex]
            saveDB(db)
            m.reply(`*🌑 El vínculo se ha roto.* Vuelves a la soledad.`)
            break

        case 'pareja':
        case 'amor':
            if (!db[sender]) return m.reply('Caminas solo en las sombras...')
            const loveP = Math.floor(Math.random() * 101)
            conn.reply(m.chat, `*❤️ [ VÍNCULO ]*\n*Pareja:* @${db[sender].partner.split('@')[0]}\n*Compatibilidad:* ${loveP}%`, m, { mentions: [db[sender].partner] })
            break

        case 'marrylist':
            let couples = Object.keys(db)
            if (couples.length === 0) return m.reply('*No hay matrimonios registrados.*')
            let listStr = `*── [ 💍 𝓛𝓘𝓢𝓣𝓐 𝓓𝓔 𝓥𝓘𝓝𝓒𝓤𝓛𝓞𝓢 ] ──*\n\n`, seen = new Set()
            for (let u of couples) {
                if (!seen.has(u)) {
                    listStr += `• @${u.split('@')[0]} ♾️ @${db[u].partner.split('@')[0]}\n`
                    seen.add(u); seen.add(db[u].partner)
                }
            }
            conn.reply(m.chat, listStr, m, { mentions: Array.from(seen) })
            break

        case 'adoptar':
            if (!db[sender]) return m.reply('Cásate primero.')
            if (!text) return m.reply(`*🍼 Uso:* ${usedPrefix}adoptar [Nombre]`)
            db[sender].children.push(text)
            db[db[sender].partner].children = db[sender].children
            saveDB(db)
            m.reply(`*✨ @${sender.split('@')[0]} y @${db[sender].partner.split('@')[0]} adoptaron a "${text}".*`, null, { mentions: [sender, db[sender].partner] })
            break

        case 'familia':
            if (!db[sender]) return m.reply('No tienes familia.')
            let f = db[sender]
            let fam = `*💠 𝐁𝐀𝐑𝐁𝐎𝐙𝐀 𝐅𝐀𝐌𝐈𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌 💠*\n\n*🥷 Padres:* @${sender.split('@')[0]} & @${f.partner.split('@')[0]}\n*👶 Hijos:* ${f.children?.join(', ') || 'Ninguno'}`
            conn.reply(m.chat, fam, m, { mentions: [sender, f.partner] })
            break
    }
}

handler.help = ['marry', 'divorce', 'pareja', 'amor', 'marrylist', 'adoptar', 'familia']
handler.tags = ['fun']
handler.command = /^(marry|divorce|pareja|amor|marrylist|adoptar|familia)$/i
handler.group = true

export default handler
