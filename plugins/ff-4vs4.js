import fetch from "node-fetch"

let handler = async (m, { conn, usedPrefix, command }) => {
    const img = 'https://cdn.russellxz.click/16b3faeb.jpeg'
    const fkontak = { key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'AlienMenu' }, message: { locationMessage: { name: '🔱 RETO 4 VS 4 🔱', jpegThumbnail: await (await fetch('https://files.catbox.moe/1j784p.jpg')).buffer() } } }

    const caption = `╭─❍ *4 VS 4 | RETO SASUKE* 🔥
│
│🏆 *Escuadra 1:*
│   👑 1. • Por definir
│   🥷🏻 2. • Por definir
│   🥷🏻 3. • Por definir
│   🥷🏻 4. • Por definir
│
│🧱 *Suplentes:*
│   🥷🏻 5. • Por definir
│   🥷🏻 6. • Por definir
╰───────────────❍
👉 *Responde a este mensaje con el número de tu posición para anotarte.*`

    let msg = await conn.sendMessage(m.chat, { image: { url: img }, caption: caption }, { quoted: fkontak })

    // Guardamos la lista en la DB temporal
    global.db.data.vs4 = global.db.data.vs4 ? global.db.data.vs4 : {}
    global.db.data.vs4[msg.key.id] = {
        1: null, 2: null, 3: null, 4: null, 5: null, 6: null
    }
}

// ESTE ES EL QUE ESCUCHA LOS NÚMEROS
handler.all = async function (m) {
    if (!m.quoted || !m.quoted.id || !global.db.data.vs4 || !global.db.data.vs4[m.quoted.id]) return
    
    // Validar que sea un número del 1 al 6
    let slot = parseInt(m.text)
    if (isNaN(slot) || slot < 1 || slot > 6) return

    let data = global.db.data.vs4[m.quoted.id]
    let user = m.sender

    // Verificar si el lugar está ocupado o si el usuario ya está en la lista
    if (Object.values(data).includes(user)) return
    if (data[slot]) return // Lugar ya ocupado

    // Anotar al usuario
    data[slot] = user

    const newCaption = `╭─❍ *4 VS 4 | RETO SASUKE* 🔥
│
│🏆 *Escuadra 1:*
│   👑 1. • ${data[1] ? `@${data[1].split('@')[0]}` : 'Por definir'}
│   🥷🏻 2. • ${data[2] ? `@${data[2].split('@')[0]}` : 'Por definir'}
│   🥷🏻 3. • ${data[3] ? `@${data[3].split('@')[0]}` : 'Por definir'}
│   🥷🏻 4. • ${data[4] ? `@${data[4].split('@')[0]}` : 'Por definir'}
│
│🧱 *Suplentes:*
│   🥷🏻 5. • ${data[5] ? `@${data[5].split('@')[0]}` : 'Por definir'}
│   🥷🏻 6. • ${data[6] ? `@${data[6].split('@')[0]}` : 'Por definir'}
╰───────────────❍`

    // Editar la lista y borrar el mensaje del número para que el chat no se llene de basura
    await this.sendMessage(m.chat, { text: newCaption, edit: m.quoted.vM.key, mentions: Object.values(data).filter(v => v !== null) })
    await this.sendMessage(m.chat, { delete: m.key }) 
}

handler.command = /^(vs4|4vs4|masc4)$/i
handler.group = true
export default handler
