import axios from 'axios'
import { createHash } from 'crypto'
import PhoneNumber from 'awesome-phonenumber'
import moment from 'moment-timezone'

// Expresión regular corregida para aceptar nombre.edad o nombre|edad
let Reg = /([^.|]+)[.|]([0-9]+)/i 

let handler = async function (m, { conn, text, args, usedPrefix, command }) {
    let user = global.db.data.users[m.sender]
    
    if (user.registered === true) {
        return m.reply(`🦅 *Tu nombre ya está escrito en el pergamino...*\n\nSi deseas borrar tu rastro, usa:\n*${usedPrefix}unreg*`)
    }

    // Validación del texto
    if (!Reg.test(text)) return m.reply(`⚠️ *FORMATO INCORRECTO*\n\nUso: ${usedPrefix + command} nombre.edad\nEjemplo: *${usedPrefix + command} Sasuke.17*`)

    let [_, name, age] = text.match(Reg)
    
    if (!name || name.trim().length < 3) return m.reply('⚛️ Ingresa un nombre válido (mínimo 3 letras).')
    if (!age) return m.reply('⚛️ Ingresa una edad válida.')
    
    age = parseInt(age)
    if (age > 99) return m.reply('⌛ Edad no permitida.')
    if (age < 5) return m.reply('⌛ Muy joven para este camino.')

    user.name = name.trim()
    user.age = age
    user.regTime = +new Date
    user.registered = true
    
    // Recompensa
    user.money = (user.money || 0) + 500  

    let sn = createHash('md5').update(m.sender).digest('hex')
    
    let regbot = `╔══⚡  *𝐒𝐀𝐒𝐔𝐊𝐄 - 𝐁𝐎𝐓* ⚡══╗
║
║  🦅 *𝐍𝐈𝐍𝐉𝐀 𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐀𝐃𝐎*
║
╠══🔹 *𝙳𝙴𝚃𝙰𝙻𝙻𝙴𝚂* 🔹
║ 👤 *ɴᴏᴍʙʀᴇ:* ${user.name}
║ 🧬 *ᴇᴅᴀᴅ:* ${user.age} años
║
╠══🔹 *𝙱𝙾𝙽𝙾* 🔹
║ 🪙 *ᴄᴏɪɴs:* 500
║
╚═════════════════╝

*NÚMERO DE SERIE:*
> ${sn}

*Usa #perfil para ver tus monedas.*`

    await conn.sendMessage(m.chat, {
        text: regbot,
        contextInfo: {
            externalAdReply: {
                title: '⚡ 𝗩𝗘𝗥𝗜𝗙𝗜𝗖𝗔𝗖𝗜𝗢́𝗡 𝗖𝗢𝗡𝗖𝗟𝗨𝗜𝗗𝗔 ⚡',
                body: 'Has recibido 500 Coins de bienvenida.',
                thumbnailUrl: 'https://files.catbox.moe/t7uytz.png',
                mediaType: 1,
                showAdAttribution: true,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m });

    // Notificación al Canal (Asegúrate que el ID sea correcto sin espacios al final)
    let chtxt = `👤 *𝚄𝚜𝚎𝚛* » ${m.pushName || 'Ninja'}
🗂 *𝚅𝚎𝚛𝚒𝚏𝚒𝚌𝚊𝚌𝚒𝚘́𝚗* » ${user.name}
🍨 *𝙴𝚍𝚊𝚍* » ${user.age} años
🪙 *𝚁𝚎𝚌𝚘𝚖𝚙𝚎𝚗𝚜𝚊* » 500 Coins`;

    let channelID = '120363423619689248@newsletter';
    try {
        await conn.sendMessage(channelID, { text: chtxt });
    } catch (e) {
        console.log('Error al enviar al canal:', e);
    }
};

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler
