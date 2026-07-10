let handler = async (m, { text, usedPrefix, command }) => {
    global.db.data.sticker = global.db.data.sticker || {}
    let hash = m.msg?.fileSha256 || m.quoted?.fileSha256 || m.fileSha256
    
    if (!hash) return m.reply('*⚠️ Responde a un sticker.*')
    if (!text) return m.reply(`*⚠️ Especifica el comando.*\n*Ejemplo:* ${usedPrefix + command} #group-cerrar.js`)
    
    let hashStr = Buffer.isBuffer(hash) ? hash.toString('base64') : hash
    
    global.db.data.sticker[hashStr] = {
        text: text.trim(),
        mentionedJid: m.mentionedJid,
        creator: m.sender,
        at: +new Date()
    }
    
    console.log('[LOG SETCMD] Hash generado:', hashStr)
    console.log('[LOG SETCMD] Comando guardado:', text.trim())
    
    m.reply(`*✅ Sticker asignado correctamente al comando:* \`${text.trim()}\`\n*Hash:* \`${hashStr.slice(0, 10)}...\``)
}
handler.help = ['setcmd']
handler.tags = ['database']
handler.command = ['setcmd']
handler.rowner = true
export default handler
