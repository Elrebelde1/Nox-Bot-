// Sistema de Duelos Uchiha - Barboza Developer
let handler = async (m, { conn, text, usedPrefix, command }) => {
    let who
    if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false
    else who = m.chat

    if (!who) return m.reply(`╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   ⚔️  *𝘿𝙐𝙀𝙇𝙊 𝘿𝙀 𝙃𝙊𝙉𝙊𝙍* \n╚════════════════════╝\n\n𝙀𝙩𝙞𝙵𝙪𝙚𝙩𝙖 𝙖 𝙖𝙡𝙜𝙪𝙞𝙚𝙣 𝙥𝙖𝙧𝙖 𝙧𝙚𝙩𝙖𝙧𝙡𝙤.\n\n*𝙀𝙟𝙚𝙢𝙥𝙡𝙤:* ${usedPrefix + command} @𝙖𝙡𝙜𝙪𝙞𝙚𝙣`)

    if (who === m.sender) return m.reply('🛑 ¿𝙏𝙚 𝙫𝙖𝙨 𝙖 𝙙𝙖𝙧 𝙥𝙡𝙤𝙢𝙤 𝙖 𝙩𝙞 𝙢𝙞𝙨𝙢𝙤? 𝙀𝙩𝙞𝙵𝙪𝙚𝙩𝙖 𝙖 𝙤𝙩𝙧𝙤.')

    await m.react('⚔️')

    // Probabilidad equilibrada (50/50)
    let ganaRetador = Math.random() < 0.5
    let ganador = ganaRetador ? m.sender : who
    let perdedor = ganaRetador ? who : m.sender

    // Narraciones aleatorias para darle sabor al duelo
    let historias = [
        `le reventó el casco de un tiro de M1014. ¡𝙋𝙖'𝙡 𝙡𝙤𝙗𝙗𝙮! 💀`,
        `lo mandó a dormir de un preciso en la cabeza con la 𝘿𝙚𝙨𝙚𝙧𝙩 𝙀𝙖𝙜𝙡𝙚. 🔥`,
        `le ganó el high ground y le dio puras capas rojas. 🔴`,
        `lo encerró con paredes gloo y le explotó una granada en los pies. 💣`,
        `lo cazó con la 𝘼𝙒𝙈 desde el techo de Factory. 🎯`
    ]
    let remate = historias[Math.floor(Math.random() * historias.length)]

    let textoDuelo = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   ⚔️  *𝙍𝙀𝙎𝙐𝙇𝙏𝘼𝘿𝙊 𝘿𝙀𝙇 𝙋𝙑𝙋* ╚════════════════════╝

🤺 @${m.sender.split('@')[0]} 
      𝙫𝙨 
🤺 @${who.split('@')[0]}

✨ *𝙀𝙇 𝙂𝘼𝙉𝘼𝘿𝙊𝙍 𝙀𝙎:* @${ganador.split('@')[0]}
📝 *𝘿𝙀𝙏𝘼𝙇𝙇𝙀:* @${ganador.split('@')[0]} ${remate}

*◈────────── • ☄️ • ──────────◈*
🏆 *𝙌𝙪𝙚𝙙𝙖𝙨𝙩𝙚 𝙝𝙪𝙢𝙞𝙡𝙡𝙖𝙙𝙤:* @${perdedor.split('@')[0]}
✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓 𝑩𝒂𝒓𝒃𝒐𝒛𝒂`

    await conn.sendMessage(m.chat, { 
        text: textoDuelo, 
        mentions: [m.sender, who] 
    }, { quoted: m })
}

handler.help = ['duelo @user']
handler.tags = ['clan']
handler.command = /^(duelo|pvp|retar)$/i

export default handler
