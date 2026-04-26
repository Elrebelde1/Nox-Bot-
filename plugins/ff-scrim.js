let handler = async (m, { conn, usedPrefix, command }) => {

let scrim = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   ⚔️ 🔱  𝐑𝐄𝐆𝐈𝐒𝐓𝐑𝐎 𝐒𝐂𝐑𝐈𝐌  🔱 ⚔️
╚════════════════════╝

┏━━━━━━━━━━━━━━━━━━━━┓
┃ ✨  *ESCUADRA DE ÉLITE* ✨
┗━━━━━━━━━━━━━━━━━━━━┛
  🏮 1. • 👑 
  🏮 2. • ⚡ 
  🏮 3. • ⚡ 
  🏮 4. • ⚡ 

┏━━━━━━━━━━━━━━━━━━━━┓
┃ 🛡️  *RESERVAS MÉDICAS* 🛡️
┗━━━━━━━━━━━━━━━━━━━━┛
  🧪 5. • 🧱 
  🧪 6. • 🧱 

*⊱───────────────────⊰*
   🔥 𝑼𝒏𝒆𝒕𝒆 𝒂𝒍 𝑰𝒏𝒇ِي𝒆𝒓𝒏𝒐 𝑪𝒍𝒂𝒏 🔥
*⊱───────────────────⊰*

👉 *COPIA Y ANÓTATE*`

await conn.sendMessage(m.chat, { 
    text: scrim,
    contextInfo: {
        externalAdReply: {
            title: "SASUKE BOT - SCRIM FF",
            body: "Barboza Developer",
            thumbnailUrl: "https://files.catbox.moe/qmmttw.jpg",
            sourceUrl: "https://whatsapp.com/channel/0029Vb8kvXUBfxnzYWsbS81I",
            mediaType: 1,
            renderLargerThumbnail: true
        }
    }
}, { quoted: m })

}
handler.help = ['scrim']
handler.tags = ['freefire']
handler.command = /^(scrim)$/i
handler.group = true

export default handler
