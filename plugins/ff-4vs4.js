import fetch from "node-fetch"

const handler = async (m, { conn, usedPrefix, command }) => {
    // Configuración de la imagen y contacto
    const img = 'https://cdn.russellxz.click/16b3faeb.jpeg'
    const fkontak = { key: { participant: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'AlienMenu' }, message: { locationMessage: { name: '🔱 RETO 4 VS 4 🔱', jpegThumbnail: await (await fetch('https://files.catbox.moe/1j784p.jpg')).buffer() } } }

    const caption = `╭─❍ *4 VS 4 | RETO SASUKE* 🔥
│
│🏆 *Escuadra 1:*
│   👑 • Por definir
│   🥷🏻 • Por definir
│   🥷🏻 • Por definir
│   🥷🏻 • Por definir
│
│🧱 *Suplentes:*
│   🥷🏻 • Por definir
│   🥷🏻 • Por definir
╰───────────────❍`

    // Estructura de botones igual a la que pasaste
    const buttons = [
        { buttonId: `vs_titular`, buttonText: { displayText: "Anotar Titular ❤️" }, type: 1 },
        { buttonId: `vs_suplente`, buttonText: { displayText: "Anotar Suplente 👍" }, type: 1 }
    ]

    let msg = await conn.sendMessage(m.chat, { 
        image: { url: img }, 
        caption: caption, 
        footer: "By Barboza-Team ⚡", 
        buttons: buttons, 
        headerType: 4 
    }, { quoted: fkontak })

    // Guardar ID para que los botones funcionen editando este mensaje
    conn.vs4 = conn.vs4 ? conn.vs4 : {}
    conn.vs4[msg.key.id] = { titulares: [], suplentes: [] }
}

// Lógica para procesar los botones y editar la lista
export async function all(m) {
    if (!m.msg || !m.msg.selectedButtonId) return
    const id = m.msg.selectedButtonId
    const chat = m.chat
    const user = m.sender
    const msgId = m.msg.contextInfo.stanzaId

    if (this.vs4 && this.vs4[msgId]) {
        let data = this.vs4[msgId]

        // Evitar que se anote doble
        if (data.titulares.includes(user) || data.suplentes.includes(user)) return

        if (id === 'vs_titular' && data.titulares.length < 4) {
            data.titulares.push(user)
        } else if (id === 'vs_suplente' && data.suplentes.length < 2) {
            data.suplentes.push(user)
        } else {
            return // Cupo lleno o ID no válido
        }

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

        // Editar el mensaje con los nuevos datos y menciones
        await this.sendMessage(chat, { 
            text: newCaption, 
            edit: { 
                remoteJid: chat, 
                fromMe: true, 
                id: msgId 
            }, 
            mentions: [...data.titulares, ...data.suplentes] 
        })
    }
}

handler.help = ['4vs4']
handler.tags = ['freefire']
handler.command = /^(vs4|4vs4|masc4)$/i
handler.group = true

export default handler
