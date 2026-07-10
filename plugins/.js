import { cp } from 'fs'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    global.db.data.users[m.sender].customCommands = global.db.data.users[m.sender].customCommands || {}
    
    if (!text) return m.reply(`*✨ ¡Uso incorrecto! ✨*\n\nPor favor, ingresa el texto o asigna el comando que deseas guardar.\nEjemplo: *${usedPrefix + command} menu*`)

    // Verificar si el comando ingresado está permitido en tus grupos restringidos (según tu handler)
    const comandosPermitidos = ['serbot', 'subbots', 'bots', 'kick', 'code', 's', 'delsession', 'on', 'off', 'tutosub', 'antilag', 'welcome', 'bienvenida', 'antilink', 'antibot', 'modoadmin', 'nsfw', 'antinopor', 'audios', 'autoleer', 'autoread', 'antiprivado', 'detect', 'antiestados', 'autorechazar', 'autoaceptar']
    
    let cmd = text.toLowerCase().trim()
    
    if (!m.quoted) return m.reply(`*👋🏼 Responde a un sticker o mensaje al que quieras asignarle el comando: "${cmd}"*`)
    
    let hash = m.quoted.fileSha256 ? m.quoted.fileSha256.toString('base64') : null
    if (!hash) return m.reply('*⚠️ Solo puedes asignar comandos a stickers, imágenes, audios o videos.*')

    // Inicializar el almacenamiento global de comandos por Hash si no existe
    global.db.data.sticker = global.db.data.sticker || {}
    
    global.db.data.sticker[hash] = {
        text: cmd,
        mentionedJid: m.mentionedJid,
        creator: m.sender,
        at: +new Date()
    }
    
    m.reply(`*🌃 ¡Comando guardado con éxito! 🌃*\n\n~ *Hash:* \`${hash}\`\n~ *Comando asignado:* \`${cmd}\``)
}

handler.help = ['setcmd <texto>']
handler.tags = ['database', 'premium']
handler.command = ['setcmd', 'addcmd']
handler.premium = true // Puedes cambiarlo a false si quieres que lo use cualquiera

export default handler
