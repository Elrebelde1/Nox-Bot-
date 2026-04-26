// Inspector de Emergencia - Barboza Developer
let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   🔍  *𝙄𝙉𝙎𝙋𝙀𝘾𝙏𝙊𝙍 𝙐𝘾𝙃𝙄𝙃𝘼* \n╚════════════════════╝\n\n𝙄𝙣𝙜𝙧𝙚𝙨𝙖 𝙚𝙡 𝙄𝘿 𝙥𝙖𝙧𝙖 𝙜𝙚𝙣𝙚𝙧𝙖𝙧 𝙚𝙡 𝙖𝙣𝙖́𝙡𝙞𝙨𝙞𝙨.\n\n*𝙀𝙟𝙚𝙢𝙥𝙡𝙤:* ${usedPrefix + command} 3244028885`)

    await m.react('⏳')

    // Creamos enlaces directos a los visualizadores de perfiles más estables
    let link1 = `https://ff.garena.com/es/player/${text}`
    let link2 = `https://freefire.com.br/en/card/${text}`

    let info = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   👤  *𝘼𝙉𝘼́𝙇𝙄𝙎𝙄𝙎 𝘿𝙀 𝙄𝘿* ╚════════════════════╝

🔍 *𝙄𝘿 𝘼 𝙍𝙀𝙑𝙄𝙎𝘼𝙍:* ${text}

𝙇𝙖𝙨 𝘼𝙋𝙄𝙨 𝙚𝙨𝙩𝙖́𝙣 𝙨𝙖𝙩𝙪𝙧𝙖𝙙𝙖𝙨, 𝙥𝙚𝙧𝙤 𝙖𝙦𝙪𝙞́ 𝙩𝙞𝙚𝙣𝙚𝙨 𝙡𝙤𝙨 𝙚𝙣𝙡𝙖𝙘𝙚𝙨 𝙙𝙞𝙧𝙚𝙘𝙩𝙤𝙨 𝙥𝙖𝙧𝙖 𝙫𝙚𝙧 𝙨𝙪 𝙣𝙞𝙫𝙚𝙡, 𝙧𝙖𝙣𝙜𝙤 𝙮 𝙧𝙚𝙜𝙞𝙤́𝙣 𝙨𝙞𝙣 𝙚𝙧𝙧𝙤𝙧𝙚𝙨:

🌐 *𝙊𝙋𝘾𝙄𝙊́𝙉 1 (𝙊𝙛𝙞𝙘𝙞𝙖𝙡):*
${link1}

🌐 *𝙊𝙋𝘾𝙄𝙊́𝙉 2 (𝙑𝙞𝙨𝙪𝙖𝙡):*
${link2}

*◈────────── • ☄️ • ──────────◈*
✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 ✨`

    await conn.sendMessage(m.chat, { 
        text: info,
        contextInfo: {
            externalAdReply: {
                title: '𝙎𝙖𝙨𝙪𝙠𝙚 𝙄𝙣𝙨𝙥𝙚𝙘𝙩𝙤𝙧 🕵️‍♂️',
                body: `Revisando ID: ${text}`,
                thumbnailUrl: 'https://files.catbox.moe/qmmttw.jpg',
                sourceUrl: link1,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })
    
    await m.react('✅')
}

handler.help = ['inspect <id>']
handler.tags = ['clan']
handler.command = /^(inspect|inspectar|id)$/i

export default handler
