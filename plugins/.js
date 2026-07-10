let handler = async (m, { text, usedPrefix, command }) => {
    global.db.data.sticker = global.db.data.sticker || {}
    
    if (!m.quoted) return m.reply('*⚠️ Responde al sticker que deseas asignar como comando.*')
    if (!m.quoted.fileSha256) return m.reply('*⚠️ El archivo no contiene un hash válido.*')
    if (!text) return m.reply(`*⚠️ Especifica el comando.*\n\n*Ejemplo:*\n> *${usedPrefix + command} #group-cerrar.js*`)

    let hash = m.quoted.fileSha256.toString('base64')
    
    global.db.data.sticker[hash] = {
        text: text.trim(),
        mentionedJid: m.mentionedJid,
        creator: m.sender,
        at: +new Date()
    }

    m.reply(`*✅ Sticker asignado correctamente al comando:* \`${text.trim()}\``)
}

handler.help = ['setcmd']
handler.tags = ['database']
handler.command = ['setcmd']
handler.rowner = true

export default handler
