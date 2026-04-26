let handler = async (m, { conn, usedPrefix }) => {
  let doc = {
    text: `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   👑  𝐌𝐄𝐍Ú 𝐅𝐑𝐄𝐄 𝐅𝐈𝐑𝐄  👑
╚════════════════════╝

📍 *𝙐𝙎𝙐𝘼𝙍𝙄𝙊:* @${m.sender.split('@')[0]}

┏━━━━━━━━━━━━━━━━━━━━┓
┃ 🎮 *𝘾𝙇𝘼𝙉 𝙂𝙀𝙎𝙏𝙄𝙊́𝙉*
┗━━━━━━━━━━━━━━━━━━━━┛
🖤 ➺ *${usedPrefix}𝙙𝙤𝙣𝙖𝙧𝙨𝙖𝙡𝙖*
🖤 ➺ *${usedPrefix}𝙧𝙚𝙜𝙡𝙖𝙨*
🖤 ➺ *${usedPrefix}𝙨𝙚𝙩𝙧𝙚𝙜𝙡𝙖𝙨*
🖤 ➺ *${usedPrefix}𝙗𝙤𝙧𝙧𝙖𝙧𝙚𝙜𝙡𝙖𝙨*

┏━━━━━━━━━━━━━━━━━━━━┓
┃ 🗺️ *𝙈𝘼𝙋𝘼𝙎 𝙀𝙎𝙏𝙍𝘼𝙏𝙀́𝙂𝙄𝘾𝙊𝙎*
┗━━━━━━━━━━━━━━━━━━━━┛
🖤 ➺ *${usedPrefix}𝙢𝙖𝙥𝙖 𝙗𝙚𝙧𝙢𝙪𝙙𝙖*
🖤 ➺ *${usedPrefix}𝙢𝙖𝙥𝙖 𝙥𝙪𝙧𝙜𝙖𝙩𝙤𝙧𝙞𝙤*
🖤 ➺ *${usedPrefix}𝙢𝙖𝙥𝙖 𝙠𝙖𝙡𝙖𝙝𝙖𝙧𝙞*
🖤 ➺ *${usedPrefix}𝙢𝙖𝙥𝙖 𝙣𝙚𝙭𝙩𝙚𝙧𝙧𝙖*
🖤 ➺ *${usedPrefix}𝙢𝙖𝙥𝙖 𝙖𝙡𝙥𝙚𝙨*

┏━━━━━━━━━━━━━━━━━━━━┓
┃ ⚔️ *𝙇𝙄𝙎𝙏𝘼 𝘿𝙀 𝙑𝙀𝙍𝙎𝙐𝙎*
┗━━━━━━━━━━━━━━━━━━━━┛
⚔ ➺ *.4𝙫𝙨4 | .6𝙫𝙨6 | .8𝙫𝙨8*
⚔ ➺ *.12𝙫𝙨12 | .16𝙫𝙨16*
⚔ ➺ *.20𝙫𝙨20 | .24𝙫𝙨24*
⚔ ➺ *.𝙨𝙘𝙧𝙞𝙢*

*◈────────── • ☄️ • ──────────◈*
✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 ✨`,
    contextInfo: {
      mentionedJid: [m.sender],
      externalAdReply: {
        title: "SASUKE BOT - FREE FIRE",
        body: "Control Total de Clan",
        thumbnailUrl: "https://files.catbox.moe/qmmttw.jpg",
        sourceUrl: "https://whatsapp.com/channel/0029Vb8kvXUBfxnzYWsbS81I",
        mediaType: 1,
        showAdAttribution: true,
        renderLargerThumbnail: true
      }
    }
  }

  await conn.sendMessage(m.chat, doc, { quoted: m })
}

handler.help = ['ff']
handler.tags = ['main']
handler.command = ['ff', 'menuff', 'freefire']

export default handler
