let handler = m => m

// 1. Lógica del Detector (se ejecuta siempre)
handler.before = async function (m, { conn }) {
    if (!m.messageStubType || !m.isGroup) return
    let chat = global.db.data.chats[m.chat]
    if (!chat || !chat.detect) return

    let fkontak = { key: { participants: "0@s.whatsapp.net", remoteJid: "status@broadcast", fromMe: false, id: "AlienMenu" }, message: { locationMessage: { name: "*Sasuke Bot MD 🌀*", jpegThumbnail: await (await fetch('https://files.catbox.moe/1j784p.jpg')).arrayBuffer().then(b => Buffer.from(b)), vcard: "BEGIN:VCARD\nVERSION:3.0\nN:;Sasuke;;;\nFN:Sasuke Bot\nORG:Barboza Developers\nitem1.TEL;waid=19709001746:+1 (970) 900-1746\nitem1.X-ABLabel:Alien\nEND:VCARD" } }, participant: "0@s.whatsapp.net" }
    
    let usuario = `@${m.sender.split`@`[0]}`
    let pp = await conn.profilePictureUrl(m.chat, 'image').catch(_ => null) || 'https://files.catbox.moe/xr2m6u.jpg'

    // Definición de mensajes
    let msgs = {
        21: `✨ ${usuario} *ha cambiado el nombre del grupo* ✨\n\n> 📝 *Nuevo nombre:* _${m.messageStubParameters[0]}_`,
        22: `📸 *¡Nueva foto de grupo!* 📸\n\n> 💫 Acción realizada por: ${usuario}`,
        23: `🔗 *¡El enlace del grupo ha sido restablecido!* 🔗\n\n> 💫 Acción realizada por: ${usuario}`,
        25: `⚙️ ${usuario} ha ajustado la configuración del grupo.\n\n> 🔒 Ahora *${m.messageStubParameters[0] == 'on'? 'solo los administradores': 'todos'}* pueden configurar el grupo.`,
        26: `🗣️ El grupo ha sido *${m.messageStubParameters[0] == 'on'? 'cerrado': 'abierto'}* por ${usuario}!\n\n> 💬 Ahora *${m.messageStubParameters[0] == 'on'? 'solo los administradores': 'todos'}* pueden enviar mensajes.`,
        29: `👑 @${m.messageStubParameters[0].split`@`[0]} *¡Ahora es administrador del grupo!* 👑\n\n> 💫 Acción realizada por: ${usuario}`,
        30: `🗑️ @${m.messageStubParameters[0].split`@`[0]} *ha dejado de ser administrador del grupo.* 🗑️\n\n> 💫 Acción realizada por: ${usuario}`
    }

    if (msgs[m.messageStubType]) {
        let text = msgs[m.messageStubType]
        let mentions = [m.sender]
        if (m.messageStubType == 29 || m.messageStubType == 30) mentions.push(m.messageStubParameters[0])
        await conn.sendMessage(m.chat, { text: text, mentions: mentions }, { quoted: fkontak })
    }
}

// 2. Lógica del Comando (Configuración .detect on/off)
handler.all = async (m, { conn, text, usedPrefix, command }) => {
    if (command === 'detect') {
        let chat = global.db.data.chats[m.chat]
        if (!text) return m.reply(`🛸 *[ BOX BOT MD ]* 🌌\n\n🚩 *Uso:* ${usedPrefix + command} *on/off*`)
        chat.detect = (text.toLowerCase() === 'on')
        m.reply(`🛸 *[ BOX BOT MD ]* 🌌\n\n✅ *Detector de cambios* ha sido ${chat.detect ? 'activado' : 'desactivado'} para este grupo.`)
    }
}

handler.help = ['detect <on/off>']
handler.tags = ['grupos']
handler.command = /^(detect)$/i
handler.group = true
handler.admin = true

export default handler
