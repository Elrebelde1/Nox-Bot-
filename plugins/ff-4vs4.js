import fetch from "node-fetch"

let handler = async (m, { conn, usedPrefix, command }) => {
    const img = 'https://cdn.russellxz.click/16b3faeb.jpeg'
    // Fake contact para el diseño
    const fkontak = { 
        key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'AlienMenu' }, 
        message: { locationMessage: { name: '🔱 RETO 4 VS 4 🔱', jpegThumbnail: await (await fetch('https://files.catbox.moe/1j784p.jpg')).buffer() } } 
    }

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

    // Guardar el estado de la lista en la base de datos global usando el ID del mensaje
    global.db.data.vs4 = global.db.data.vs4 ? global.db.data.vs4 : {}
    global.db.data.vs4[msg.key.id] = {
        1: null, 2: null, 3: null, 4: null, 5: null, 6: null
    }
}

handler.all = async function (m) {
    // Validar que sea una respuesta a un mensaje de lista activo
    if (!m.quoted || !m.quoted.id || !global.db.data.vs4 || !global.db.data.vs4[m.quoted.id]) return
    
    let slot = parseInt(m.text)
    // Solo actuar si el mensaje es un número del 1 al 6
    if (isNaN(slot) || slot < 1 || slot > 6) return

    let data = global.db.data.vs4[m.quoted.id]
    let user = m.sender
    let name = m.pushName || 'Sin nombre'

    // Evitar que un usuario se anote dos veces
    if (Object.values(data).some(v => v?.id === user)) {
        return this.reply(m.chat, `⚠️ Ya estás anotado en esta lista.`, m)
    }
    
    // Verificar si el lugar ya está ocupado
    if (data[slot]) {
        return this.reply(m.chat, `❌ El lugar ${slot} ya está ocupado por ${data[slot].name}.`, m)
    }

    // Registrar al usuario
    data[slot] = { id: user, name: name }

    // Generar el nuevo texto con los nombres actualizados
    const newCaption = `╭─❍ *4 VS 4 | RETO SASUKE* 🔥
│
│🏆 *Escuadra 1:*
│   👑 1. • ${data[1] ? `*${data[1].name}*` : 'Por definir'}
│   🥷🏻 2. • ${data[2] ? `*${data[2].name}*` : 'Por definir'}
│   🥷🏻 3. • ${data[3] ? `*${data[3].name}*` : 'Por definir'}
│   🥷🏻 4. • ${data[4] ? `*${data[4].name}*` : 'Por definir'}
│
│🧱 *Suplentes:*
│   🥷🏻 5. • ${data[5] ? `*${data[5].name}*` : 'Por definir'}
│   🥷🏻 6. • ${data[6] ? `*${data[6].name}*` : 'Por definir'}
╰───────────────❍
👉 *Responde con un número para anotarte.*`

    // EDITAR el mensaje original para mostrar el nombre
    await this.sendMessage(m.chat, { 
        text: newCaption, 
        edit: m.quoted.vM.key,
        mentions: Object.values(data).filter(v => v !== null).map(v => v.id)
    })

    // Confirmación visual para el usuario
    await this.reply(m.chat, `✅ *¡Anotado correctamente!*
👤 *Jugador:* ${name}
📍 *Posición:* ${slot <= 4 ? 'Titular' : 'Suplente'} #${slot}`, m)

    // Opcional: Borrar el número que envió el usuario para mantener limpio el chat
    try {
        await this.sendMessage(m.chat, { delete: m.key })
    } catch {
        // Ignorar si no hay permisos de admin para borrar
    }
}

handler.command = /^(vs4|4vs4|masc4)$/i
handler.group = true

export default handler
