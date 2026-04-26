// Sistema de Postulación - Barboza Developer
let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   📝  *𝙍𝙀𝘾𝙇𝙐𝙏𝘼𝙈𝙄𝙀𝙉𝙏𝙊* \n╚════════════════════╝\n\n𝙋𝙖𝙧𝙖 𝙥𝙤𝙨𝙩𝙪𝙡𝙖𝙧𝙩𝙚, 𝙪𝙨𝙖 𝙚𝙡 𝙘𝙤𝙢𝙖𝙣𝙙𝙤 𝙖𝙨𝙞́:\n${usedPrefix + command} 𝙉𝙞𝙘𝙠, 𝙄𝘿, 𝙉𝙞𝙫𝙚𝙡, 𝙍𝙖𝙣𝙜𝙤, 𝙍𝙚𝙜𝙞𝙤́𝙣\n\n*𝙀𝙟𝙚𝙢𝙥𝙡𝙤:* ${usedPrefix + command} 𝙎𝙖𝙨𝙪𝙠𝙚𝙁𝙁, 3244028885, 72, 𝙂𝙧𝙖𝙣 𝙈𝙖𝙚𝙨𝙩𝙧𝙤, 𝙀𝙀𝙐𝙐`)

    let [nick, id, nivel, rango, region] = text.split(',')
    if (!nick || !id || !nivel || !rango || !region) return m.reply(`⚠️ *𝙁𝙖𝙡𝙩𝙖𝙣 𝙙𝙖𝙩𝙤𝙨.* 𝘼𝙨𝙚𝙜𝙪́𝙧𝙖𝙩𝙚 𝙙𝙚 𝙪𝙨𝙖𝙧 𝙘𝙤𝙢𝙖𝙨 ( , ) 𝙥𝙖𝙧𝙖 𝙨𝙚𝙥𝙖𝙧𝙖𝙧 𝙡𝙖 𝙞𝙣𝙛𝙤.`)

    await m.react('📝')

    let info = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   ⚔️  *𝙎𝙊𝙇𝙄𝘾𝙄𝙏𝙐𝘿 𝘿𝙀 𝙄𝙉𝙂𝙍𝙀𝙎𝙊* ╚════════════════════╝

👤 *𝙉𝙄𝘾𝙆:* ${nick.trim()}
🆔 *𝙄𝘿:* ${id.trim()}
🏆 *𝙉𝙄𝙑𝙀𝙇:* ${nivel.trim()}
🎖️ *𝙍𝘼𝙉𝙂𝙊:* ${rango.trim()}
🌎 *𝙍𝙀𝙂𝙄𝙊́𝙉:* ${region.trim()}

📝 *𝙀𝙎𝙏𝘼𝘿𝙊:* 𝙀𝙣 𝙚𝙨𝙥𝙚𝙧𝙖 𝙙𝙚 𝙧𝙚𝙫𝙞𝙨𝙞𝙤́𝙣...

*◈────────── • ☄️ • ──────────◈*
✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 ✨`

    await conn.sendMessage(m.chat, { 
        image: { url: 'https://files.catbox.moe/qmmttw.jpg' }, 
        caption: info 
    }, { quoted: m })
}

handler.help = ['postular']
handler.tags = ['clan']
handler.command = /^(postular|reclutar|solicitud)$/i

export default handler
