let handler = async (m, { text, usedPrefix, command }) => {
    global.db.data.sticker = global.db.data.sticker || {}
    
    // Obtener el objeto del mensaje (si es sticker o citado)
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    if (!/sticker/.test(mime)) return m.reply('*⚠️ Responde a un sticker.*')
    if (!q.fileSha256) return m.reply('*⚠️ El sticker no tiene un hash válido.*')
    if (!text) return m.reply(`*⚠️ Escribe el nombre del comando.*\n*Ejemplo:* ${usedPrefix + command} #group-cerrar.js`)

    // Convertimos a base64 de la misma forma que en el handler
    let hash = Buffer.isBuffer(q.fileSha256) ? q.fileSha256.toString('base64') : q.fileSha256
    
    global.db.data.sticker[hash] = {
        text: text.trim(),
        creator: m.sender,
        at: +new Date()
    }

    m.reply(`*✅ Comando asignado al sticker:* \`${text.trim()}\``)
}

handler.help = ['setcmd']
handler.tags = ['database']
handler.command = ['setcmd']
handler.rowner = true

export default handler
