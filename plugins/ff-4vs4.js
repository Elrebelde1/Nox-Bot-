import fetch from "node-fetch"

const handler = async (m, { conn, usedPrefix, command, text }) => {
    // 1. LÓGICA DE REGISTRO (CUANDO SE PRESIONA EL BOTÓN)
    // El botón envía un comando tipo: .4vs4 anotar_t [ID_MENSAJE]
    if (text && (text.startsWith('anotar_t') || text.startsWith('anotar_s'))) {
        let [tipo, msgId] = text.split(' ')
        if (!conn.vs4 || !conn.vs4[msgId]) return 

        let data = conn.vs4[msgId]
        let user = m.sender

        // Evitar duplicados
        if (data.titulares.includes(user) || data.suplentes.includes(user)) return

        if (tipo === 'anotar_t' && data.titulares.length < 4) {
            data.titulares.push(user)
        } else if (tipo === 'anotar_s' && data.suplentes.length < 2) {
            data.suplentes.push(user)
        } else {
            return 
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

        return await conn.sendMessage(m.chat, { 
            text: newCaption, 
            edit: { remoteJid: m.chat, fromMe: true, id: msgId }, 
            mentions: [...data.titulares, ...data.suplentes] 
        })
    }

    // 2. MENSAJE INICIAL (CUANDO SE TIRA EL COMANDO)
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

    let msg = await conn.sendMessage(m.chat, { 
        image: { url: img }, 
        caption: caption, 
        footer: "By Barboza-Team ⚡", 
        // IMPORTANTE: El ID del mensaje va en el buttonId para saber qué lista editar
        buttons: [
            { buttonId: `${usedPrefix + command} anotar_t ${m.key.id}`, buttonText: { displayText: "Anotar Titular ❤️" }, type: 1 },
            { buttonId: `${usedPrefix + command} anotar_s ${m.key.id}`, buttonText: { displayText: "Anotar Suplente 👍" }, type: 1 }
        ], 
        headerType: 4 
    }, { quoted: fkontak })

    conn.vs4 = conn.vs4 ? conn.vs4 : {}
    conn.vs4[msg.key.id] = { titulares: [], suplentes: [] }
}

handler.command = /^(vs4|4vs4|masc4)$/i
handler.group = true
export default handler
