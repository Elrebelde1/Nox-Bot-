let handler = async (m, { conn, usedPrefix }) => {
  let doc = {
    text: `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   👑  𝐌𝐄𝐍Ú 𝐅𝐑𝐄𝐄 𝐅𝐈𝐑𝐄  👑
╚════════════════════╝

📍 *USUARIO:* @${m.sender.split('@')[0]}

┏━━━━━━━━━━━━━━━━━━━━┓
┃ 🎮 *CLAN GESTIÓN*
┗━━━━━━━━━━━━━━━━━━━━┛
🖤 ➺ ${usedPrefix}donarsala
🖤 ➺ ${usedPrefix}reglas
🖤 ➺ ${usedPrefix}setreglas
🖤 ➺ ${usedPrefix}borrareglas

┏━━━━━━━━━━━━━━━━━━━━┓
┃ 🗺️ *MAPAS ESTRATÉGICOS*
┗━━━━━━━━━━━━━━━━━━━━┛
🖤 ➺ ${usedPrefix}mapa bermuda
🖤 ➺ ${usedPrefix}mapa purgatorio
🖤 ➺ ${usedPrefix}mapa kalahari
🖤 ➺ ${usedPrefix}mapa nexterra
🖤 ➺ ${usedPrefix}mapa alpes

┏━━━━━━━━━━━━━━━━━━━━┓
┃ ⚔️ *LISTA DE VERSUS*
┗━━━━━━━━━━━━━━━━━━━━┛
⚔ ➺ .4vs4 | .6vs6 | .8vs8
⚔ ➺ .12vs12 | .16vs16
⚔ ➺ .20vs20 | .24vs24
⚔ ➺ .scrim

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
