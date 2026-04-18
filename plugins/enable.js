let handler = async (m, { conn, usedPrefix, command, args, isOwner, isAdmin, isROwner }) => {
let isEnable = /true|enable|(turn)?on|1/i.test(args[0])
let chat = global.db.data.chats[m.chat]
let bot = global.db.data.settings[conn.user.jid] || {}
let type = command.toLowerCase()

if (m.isGroup) {
if (!('antiLag' in chat)) chat.antiLag = false
}

if (!args[0]) return m.reply(`⚠️ *Formato incorrecto*\n\n📌 Uso: *${usedPrefix + command} on* o *${usedPrefix + command} off*`)

let fail = false
switch (type) {
case 'welcome': case 'bienvenida':
if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); fail = true; break }
chat.bienvenida = isEnable
break
case 'antilag':
chat.antiLag = isEnable
break
case 'subbots': case 'serbot':
if (!isROwner) { global.dfail('rowner', m, conn); fail = true; break }
bot.jadibotmd = isEnable
break
case 'antispam':
if (!isOwner) { global.dfail('owner', m, conn); fail = true; break }
bot.antiSpam = isEnable
break
case 'antilink':
if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); fail = true; break }
chat.antiLink = isEnable
break
case 'antibot':
if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); fail = true; break }
chat.antiBot = isEnable
break
case 'modoadmin':
if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); fail = true; break }
chat.modoadmin = isEnable
break
case 'nsfw': case 'antinopor':
if (m.isGroup && !isAdmin) { global.dfail('admin', m, conn); fail = true; break }
chat.nsfw = isEnable
break
case 'audios':
chat.audios = isEnable
break
case 'autoread': case 'autoleer':
if (!isROwner) { global.dfail('rowner', m, conn); fail = true; break }
global.opts['autoread'] = isEnable
break
case 'antiprivado':
if (!isOwner) { global.dfail('owner', m, conn); fail = true; break }
bot.antiPrivate = isEnable
break
default:
return
}

if (fail) return

let statusTxt = `
┏━━━━━━━━━━━━━━━━━━┓
✨ *AJUSTE ACTUALIZADO* ✨
┠━━━━━━━━━━━━━━━━━━┫
⚙️ *Función:* ${type}
📊 *Estado:* ${isEnable ? 'Activado ✅' : 'Desactivado ❌'}
┗━━━━━━━━━━━━━━━━━━┛`.trim()

await conn.sendMessage(m.chat, {
text: statusTxt,
footer: "𝖡𝗒 𝖡𝖺𝗋𝖻𝗈𝗓𝖺-𝖳𝖾𝖺𝗆 ⚡",
contextInfo: {
externalAdReply: {
title: '𝖲𝖠𝖲𝖴𝖪𝖤 𝖡𝖮𝖳 — 𝖢𝖮𝖭𝖥𝖨𝖦',
body: 'Panel de Control Actualizado',
thumbnailUrl: 'https://files.catbox.moe/t7uytz.png',
mediaType: 1,
showAdAttribution: true
}},
buttons: [
{
name: "single_select",
buttonParamsJson: JSON.stringify({
title: "Nuestros Canales 📢",
sections: [
{
title: "Oficiales",
rows: [
{ title: "Canal Principal 👤", description: "Updates de Sasuke Bot", id: `sask_c1` },
{ title: "Canal de Soporte ⚡", description: "Ayuda y Comunidad", id: `sask_c2` }
]
}
]
})
}
]}, { quoted: m })
}

handler.help = ['welcome', 'antilag', 'antilink', 'antibot', 'modoadmin', 'subbots'].map(v => v + ' on/off')
handler.tags = ['config']
handler.command = ['welcome', 'bienvenida', 'antilag', 'subbots', 'serbot', 'antispam', 'antilink', 'antibot', 'modoadmin', 'nsfw', 'antinopor', 'audios', 'autoleer', 'autoread', 'antiprivado']

export default handler
