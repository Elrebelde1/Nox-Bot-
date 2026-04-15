import fs from 'fs'
import path from 'path'

const marriagesFile = path.resolve('media/game/marry_family.json')

// --- GESTIÓN DE BASE DE DATOS ---
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
    const userIsMarried = (user) => Object.hasOwn(db, user)

    switch (command) {
        case 'pareja':
            if (!userIsMarried(sender)) return m.reply('Hmp... Caminas solo en las sombras. No tienes un vínculo registrado.')
            let dataP = db[sender]
            let dateP = new Date(dataP.date).toLocaleDateString('es-HN')
            let msgP = `*─── [ 📜 𝓔𝓧𝓟𝓔𝓓𝓘𝓔𝓝𝓣𝓔 𝓐𝓜𝓞𝓡𝓞𝓢𝓞 ] ───*\n\n`
            msgP += `*🥷 Compañero/a:* @${dataP.partner.split('@')[0]}\n`
            msgP += `*🗓️ Sello creado:* ${dateP}\n`
            msgP += `*✨ Estado:* Vínculo Eterno`
            conn.reply(m.chat, msgP, m, { mentions: [dataP.partner] })
            break

        case 'amor':
            if (!userIsMarried(sender)) return m.reply('No puedes medir el amor si no tienes un vínculo. Busca pareja primero.')
            let lovePercent = Math.floor(Math.random() * 100) + 1
            let heart = lovePercent > 70 ? '💖' : lovePercent > 40 ? '🧡' : '💔'
            conn.reply(m.chat, `*${heart} [ 𝓝𝓘𝓥𝓔𝓛 𝓓𝓔 𝓐𝓜𝓞𝓡 ]*\n\n*Pareja:* @${sender.split('@')[0]} & @${db[sender].partner.split('@')[0]}\n*Compatibilidad:* ${lovePercent}%`, m, { mentions: [sender, db[sender].partner] })
            break

        case 'marrylist':
            let couples = Object.keys(db)
            if (couples.length === 0) return m.reply('*❌ El pergamino de vínculos está vacío.*')
            let listStr = `*─── [ 💍 𝓛𝓘𝓢𝓣𝓐 𝓓𝓔 𝓥𝓘𝓝𝓒𝓤𝓛𝓞𝓢 ] ───*\n\n`, seen = new Set(), count = 1
            for (let user of couples) {
                if (!seen.has(user)) {
                    let p = db[user].partner
                    listStr += `*${count++}.* @${user.split('@')[0]} ♾️ @${p.split('@')[0]}\n`
                    seen.add(user); seen.add(p)
                }
            }
            conn.reply(m.chat, listStr, m, { mentions: Array.from(seen) })
            break

        case 'adoptar':
            if (!userIsMarried(sender)) return m.reply('Solo los que han sellado un vínculo pueden expandir su legado.')
            if (!text) return m.reply(`*🍼 Uso:* ${usedPrefix}${command} [Nombre del hijo]`)
            if (!db[sender].children) db[sender].children = []
            db[sender].children.push(text)
            db[db[sender].partner].children = db[sender].children
            saveDB(db)
            m.reply(`*✨ Han integrado a "${text}" a la dinastía.*`)
            break

        case 'adoptar_mascota':
            if (!userIsMarried(sender)) return m.reply('Necesitas una familia para cuidar de un animal.')
            let [tipo, ...nombrePet] = text.split(' ')
            let icons = { perro: '🐶', gato: '🐱', conejo: '🐰', zorro: '🦊' }
            if (!icons[tipo?.toLowerCase()] || !nombrePet.length) return m.reply(`*🐾 Uso:* ${usedPrefix}adoptar_mascota [perro/gato/conejo/zorro] [nombre]`)
            
            let petObj = { type: icons[tipo.toLowerCase()], name: nombrePet.join(' '), hunger: 50 }
            db[sender].pet = petObj
            db[db[sender].partner].pet = petObj
            saveDB(db)
            m.reply(`*✨ ¡Nueva Mascota! Han adoptado a ${petObj.name} ${petObj.type}.*`)
            break

        case 'familia':
            if (!userIsMarried(sender)) return m.reply('No tienes una dinastía registrada. Eres un ninja errante.')
            let f = db[sender]
            let fam = `*💠 𝐁𝐀𝐑𝐁𝐎𝐙𝐀 𝐅𝐀𝐌𝐈𝐋𝐘 𝐒𝐘𝐒𝐓𝐄𝐌 💠*\n\n`
            fam += `*🥷 Padres:* @${sender.split('@')[0]} & @${f.partner.split('@')[0]}\n`
            fam += `*👶 Hijos:* ${f.children?.length ? f.children.join(', ') : 'Ninguno'}\n`
            if (f.pet) {
                fam += `*🐾 Mascota:* ${f.pet.name} ${f.pet.type}\n`
                fam += `*🍖 Hambre:* ${f.pet.hunger}% ${f.pet.hunger < 20 ? '⚠️ (Hambriento)' : ''}`
            }
            conn.reply(m.chat, fam, m, { mentions: [sender, f.partner] })
            break

        case 'alimentar':
            if (!db[sender]?.pet) return m.reply('No hay mascotas que alimentar en esta familia.')
            let pet = db[sender].pet
            if (pet.hunger >= 100) return m.reply(`*✋ ${pet.name} ya ha comido suficiente por ahora.*`)
            pet.hunger = Math.min(100, pet.hunger + 25)
            db[sender].pet = pet
            db[db[sender].partner].pet = pet
            saveDB(db)
            m.reply(`*🍖 Alimentaste a ${pet.name}. Su hambre ahora es del ${pet.hunger}%.*`)
            break
    }
}

handler.help = ['pareja', 'amor', 'marrylist', 'adoptar', 'adoptar_mascota', 'familia', 'alimentar']
handler.tags = ['fun']
handler.command = /^(pareja|amor|marrylist|adoptar|adoptar_mascota|familia|alimentar)$/i
handler.group = true

export default handler
