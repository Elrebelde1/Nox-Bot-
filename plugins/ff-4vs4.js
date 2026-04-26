import { smsg } from '../lib/simple.js'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. Verificamos que el comando traiga el ID del mensaje para saber qué lista editar
    if (!text) return 
    let [tipo, msgId] = text.split(' ')
    
    // 2. Buscamos la base de datos de esa lista específica
    if (!global.db.data.vs4 || !global.db.data.vs4[msgId]) return 

    let data = global.db.data.vs4[msgId]
    let user = m.sender

    // 3. Verificamos si el usuario ya está anotado para evitar spam
    if (data.titulares.includes(user) || data.suplentes.includes(user)) return

    // 4. Agregamos al usuario según el botón presionado
    if (tipo === 't' && data.titulares.length < 4) {
        data.titulares.push(user)
    } else if (tipo === 's' && data.suplentes.length < 2) {
        data.suplentes.push(user)
    } else {
        return // Cupos llenos
    }

    // 5. Generamos la nueva lista editada
    const newCaption = `╭─❍ *4 VS 4 | RETO SASUKE* 🔥
│
│🏆 *Escuadra 1:*
${data.titulares.map((v, i) => `│   ${i === 0 ? '👑' : '🥷🏻'} • @${v.split('@')[0]}`).join('\n')}
${Array(4 - data.titulares.length).fill('│   🥷🏻 • Por definir').join('\n')}
│
│🧱 *Suplentes:*
${data.suplentes.map(v => `│   🥷🏻 • @${v.split('@')[0]}`).join('\n')}
${Array(2 - data.suplentes.length).fill('│   🥷🏻 • Por definir').join('\n')}
╰───────────────❍`

    // 6. Ejecutamos la edición del mensaje original
    await conn.sendMessage(m.chat, { 
        text: newCaption, 
        edit: { 
            remoteJid: m.chat, 
            fromMe: true, 
            id: msgId 
        }, 
        mentions: [...data.titulares, ...data.suplentes] 
    })
}

// Estos son los comandos internos que enviarán los botones
handler.command = /^(vstarea|anotarse)$/i
handler.group = true

export default handler
