import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   🔍  *𝙄𝙉𝙎𝙋𝙀𝘾𝙏𝙊𝙍 𝙐𝘾𝙃𝙄𝙃𝘼* \n╚════════════════════╝\n\n𝙄𝙣𝙜𝙧𝙚𝙨𝙖 𝙚𝙡 𝙄𝘿 𝙦𝙪𝙚 𝙙𝙚𝙨𝙚𝙖𝙨 𝙞𝙣𝙨𝙥𝙚𝙘𝙘𝙞𝙤𝙣𝙖𝙧.\n\n*𝙀𝙟𝙚𝙢𝙥𝙡𝙤:* ${usedPrefix + command} 123456789`)

    await m.react('🔍')

    try {
        // API gratuita para consultar datos de Free Fire
        let res = await fetch(`https://free-fire-api-six.vercel.app/api/v1/info?id=${text}`)
        let json = await res.json()

        if (!json.status || !json.data) {
            await m.react('❌')
            return m.reply('🛑 *𝙄𝘿 𝙣𝙤 𝙚𝙣𝙘𝙤𝙣𝙩𝙧𝙖𝙙𝙤.* 𝙑𝙚𝙧𝙞𝙛𝙞𝙘𝙖 𝙦𝙪𝙚 𝙚𝙡 𝙣𝙪́𝙢𝙚𝙧𝙤 𝙚𝙨𝙩𝙚́ 𝙗𝙞𝙚𝙣 𝙚𝙨𝙘𝙧𝙞𝙩𝙤.')
        }

        let { nickname, level, exp, region, likes, bio, create_at } = json.data
        
        let info = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   👤  *𝘿𝘼𝙏𝙊𝙎 𝘿𝙀𝙇 𝙅𝙐𝙂𝘼𝘿𝙊𝙍* ╚════════════════════╝

✨ *𝙉𝙄𝘾𝙆:* ${nickname}
🆔 *𝙄𝘿:* ${text}
🏆 *𝙉𝙄𝙑𝙀𝙇:* ${level}
📈 *𝙀𝙓𝙋:* ${exp}
🌎 *𝙍𝙀𝙂𝙄𝙊́𝙉:* ${region}
❤️ *𝙇𝙄𝙆𝙀𝙎:* ${likes}
📆 *𝘾𝙍𝙀𝘼𝘿𝙊:* ${create_at}

📜 *𝘽𝙄𝙊:* _${bio || 'Sin biografía'}_

*◈────────── • ☄️ • ──────────◈*
✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 ✨`

        await conn.sendMessage(m.chat, { 
            image: { url: `https://api.screenshotmachine.com/?key=ca51d4&url=https://freefire.com.br/en/card/${text}&dimension=1024x768` }, // Opcional: Intenta sacar una captura del banner
            caption: info 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('🛑 *𝙀𝙍𝙍𝙊𝙍:* 𝙇𝙖 𝘼𝙋𝙄 𝙙𝙚 𝙞𝙣𝙨𝙥𝙚𝙘𝙘𝙞𝙤́𝙣 𝙚𝙨𝙩𝙖́ 𝙛𝙪𝙚𝙧𝙖 𝙙𝙚 𝙨𝙚𝙧𝙫𝙞𝙘𝙞𝙤 𝙤 𝙚𝙡 𝙄𝘿 𝙚𝙨 𝙞𝙣𝙫𝙖́𝙡𝙞𝙙𝙤.')
    }
}

handler.help = ['inspect <id>']
handler.tags = ['clan']
handler.command = /^(inspect|inspectar|id)$/i

export default handler
