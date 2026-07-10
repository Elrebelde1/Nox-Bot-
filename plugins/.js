let handler = async (m, { text, usedPrefix, command }) => {
    global.db.data.sticker = global.db.data.sticker || {}
    if (!m.quoted) return m.reply('Responde a un sticker.')
    if (!m.quoted.fileSha256) return m.reply('El archivo no es un sticker válido.')
    if (!text) return m.reply(`Uso: ${usedPrefix + command} <nombre_comando>`)
    
    let hash = m.quoted.fileSha256.toString('base64')
    global.db.data.sticker[hash] = {
        text: text,
        mentionedJid: m.mentionedJid,
        creator: m.sender,
        at: +new Date()
    }
    m.reply(`Comando asignado correctamente al sticker: ${text}`)
}
handler.help = ['setcmd']
handler.tags = ['database']
handler.command = ['setcmd']
handler.rowner = true
export default handler
