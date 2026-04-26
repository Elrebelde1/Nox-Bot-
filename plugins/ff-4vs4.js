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

    // Inicializar base de datos para este mensaje específico
    global.db.data.vs4 = global.db.data.vs4 ? global.db.data.vs4 : {}
    global.db.data.vs4[msg.key.id] = {
        1: null, 2: null, 3: null, 4: null, 5: null, 6: null
    }
}

handler.all = async function (m) {
    // Verificar que sea una respuesta a una lista activa
    if (!m.quoted || !m.quoted.id || !global.db.data.vs4 || !global.db.data.vs4[m.quoted.id]) return
    
    let slot = parseInt(m.text)
    if (isNaN(slot) || slot < 1 || slot > 6) return

    let data = global.db.data.vs4[m.quoted.id]
    let user = m.sender
    let name = m.pushName || 'Usuario'

    // Validaciones: lugar libre y usuario no repetido
    if (Object.values(data).some(v => v?.id === user)) return 
    if (data[slot]) return 

    // Anotar datos del usuario
    data[slot] = { id: user, name: name }

    // RECONSTRUCCIÓN DE LA ESCUADRA (Aquí es donde se pone el nombre)
    const newCaption = `╭─❍ *4 VS 4 | RETO SASUKE* 🔥
│
│🏆 *Escuadra 1:*
│   👑 1. • ${data[1] ? `*${data[1].name}* (@${data[1].id.split('@')[0]})` : 'Por definir'}
│   🥷🏻 2. • ${data[2] ? `*${data[2].name}* (@${data[2].id.split('@')[0]})` : 'Por definir'}
│   🥷🏻 3. • ${data[3] ? `*${data[3].name}* (@${data[3].id.split('@')[0]})` : 'Por definir'}
│   🥷🏻 4. • ${data[4] ? `*${data[4].name}* (@${data[4].id.split('@')[0]})` : 'Por definir'}
│
│🧱 *Suplentes:*
│   🥷🏻 5. • ${data[5] ? `*${data[5].name}* (@${data[5].id.split('@')[0]})` : 'Por definir'}
│   🥷🏻 6. • ${data[6] ? `*${data[6].name}* (@${data[6].id.split('@')[0]})` : 'Por definir'}
╰───────────────❍`

    // Editar la lista original con los nombres en la escuadra
    await this.sendMessage(m.chat, { 
        text: newCaption, 
        edit: m.quoted.vM.key, 
        mentions: Object.values(data).filter(v => v !== null).map(v => v.id) 
    })

    // Introducción / Confirmación
    await this.reply(m.chat, `✅ *¡Anotado correctamente!*
👤 *Jugador:* ${name}
📍 *Posición:* ${slot <= 4 ? 'Titular' : 'Suplente'} #${slot}`, m)

    // Borrar el número enviado por el usuario
    await this.sendMessage(m.chat, { delete: m.key })
}

handler.command = /^(vs4|4vs4|masc4)$/i
handler.group = true
export default handler
