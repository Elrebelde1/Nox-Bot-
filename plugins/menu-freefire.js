let handler = async (m, { conn, usedPrefix, command }) => {

  let texto = `『 ⚔️ 𝐒𝐀𝐒𝐔𝐊𝐄 𝐁𝐎𝐓 𝐌𝐃 - 𝐎𝐏𝐄𝐑𝐀𝐓𝐈𝐕𝐎 ⚔️ 』

「 👤 𝐔𝐒𝐔𝐀𝐑𝐈𝐎: @${m.sender.split('@')[0]} 」
「 📂 𝐒𝐓𝐀𝐓𝐔𝐒: Acceso Autorizado 」

◈───── ⚡ 𝐅𝐑𝐄𝐄 𝐅𝐈𝐑𝐄 ⚡ ─────◈

 🛡️  *GESTIÓN DE CLAN*
 ╰ 🎫 ${usedPrefix}donarsala
 ╰ 📜 ${usedPrefix}reglas
 ╰ ⚙️ ${usedPrefix}setreglas
 ╰ 🗑️ ${usedPrefix}borrareglas

 🗺️  *RECONOCIMIENTO DE MAPAS*
 ╰ 📍 ${usedPrefix}mapa bermuda
 ╰ 📍 ${usedPrefix}mapa purgatorio
 ╰ 📍 ${usedPrefix}mapa kalahari
 ╰ 📍 ${usedPrefix}mapa nexterra
 ╰ 📍 ${usedPrefix}mapa alpes

 ⚔️  *MODOS DE COMBATE*
 ╰ 🥊 4vs4 | 6vs6 | 8vs8
 ╰ 💀 12vs12 | 16vs16
 ╰ 🚩 20vs20 | 24vs24
 ╰ 🏆 .scrim

◈─────────────────────────◈
📡 [ 𝙲𝙾𝙽𝙴𝚇𝙸𝙾́𝙽 𝙴𝚂𝚃𝙰𝙱𝙻𝙴 ]
✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 ✨`

  // Mensaje con mención al usuario que lo solicita
  await conn.sendMessage(m.chat, { 
    text: texto,
    mentions: [m.sender],
    contextInfo: {
      externalAdReply: {
        title: "Sᴀsᴜᴋᴇ Bᴏᴛ - Cᴏɴᴛʀᴏʟ Gᴀᴍᴇʀ",
        body: "Bᴀʀʙᴏᴢᴀ Dᴇᴠᴇʟᴏᴘᴇʀ",
        thumbnailUrl: "https://files.catbox.moe/qmmttw.jpg",
        sourceUrl: "https://whatsapp.com/channel/0029Vb8kvXUBfxnzYWsbS81I",
        mediaType: 1,
        renderLargerThumbnail: false
      }
    }
  }, { quoted: m })
}

handler.help = ['ff']
handler.tags = ['freefire']
handler.command = /^(ff|menuff|fuego|garena)$/i
handler.register = true

export default handler
