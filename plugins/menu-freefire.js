let handler = async (m, { conn, usedPrefix }) => {
  let img = 'https://i.ibb.co/J55dPST/garena-free-fire-logo-rosj9f102kpok60v.jpg'

  let texto = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗
   👑  𝐌𝐄𝐍Ú 𝐅𝐑𝐄𝐄 𝐅𝐈𝐑𝐄  👑
╚════════════════════╝

┏━━━━━━━━━━━━━━━━━━━━┓
┃ 🎮 *COMANDOS DE CLAN* ┗━━━━━━━━━━━━━━━━━━━━┛
🖤 ➺ ${usedPrefix}donarsala
🖤 ➺ ${usedPrefix}reglas (Ver reglamento)
🖤 ➺ ${usedPrefix}setreglas (Configurar)
🖤 ➺ ${usedPrefix}borrareglas

┏━━━━━━━━━━━━━━━━━━━━┓
┃ 🗺️ *EXPLORACIÓN DE MAPAS*
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
✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑳𝒂 𝒗𝒐𝒛 𝒅𝒆𝒍 𝑰𝒏𝒇ِي𝒆𝒓𝒏𝒐 ✨`

  const fkontak = {
    "key": {
      "participants": "0@s.whatsapp.net",
      "remoteJid": "status@broadcast",
      "fromMe": false,
      "id": "MenuFF"
    },
    "message": {
      "contactMessage": {
        "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    "participant": "0@s.whatsapp.net"
  }

  await conn.sendMessage(m.chat, { image: { url: img }, caption: texto }, { quoted: fkontak })
}

handler.help = ['menuff']
handler.tags = ['freefire']
handler.command = /^(menuff|menufreefire|ffmenu|freefire)$/i
handler.register = true

export default handler
