import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix }) => {
  // Imagen principal del menú
  const pathImg = join(process.cwd(), 'storage', 'img', 'miniurl.jpg')
  let img = existsSync(pathImg) ? readFileSync(pathImg) : 'https://i.ibb.co/J55dPST/garena-free-fire-logo-rosj9f102kpok60v.jpg'

  let texto = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n`
  texto += `   👑  𝐌𝐄𝐍Ú 𝐅𝐑𝐄𝐄 𝐅𝐈𝐑𝐄  👑\n`
  texto += `╚════════════════════╝\n\n`

  texto += `┏━━━━━━━━━━━━━━━━━━━━┓\n`
  texto += `┃ 🎮 *COMANDOS DE CLAN* \n`
  texto += `┗━━━━━━━━━━━━━━━━━━━━┛\n`
  texto += `🖤 ➺ ${usedPrefix}donarsala\n`
  texto += `🖤 ➺ ${usedPrefix}reglas (Ver reglamento)\n`
  texto += `🖤 ➺ ${usedPrefix}setreglas (Configurar)\n`
  texto += `🖤 ➺ ${usedPrefix}borrareglas\n\n`

  texto += `┏━━━━━━━━━━━━━━━━━━━━┓\n`
  texto += `┃ 🗺️ *EXPLORACIÓN DE MAPAS*\n`
  texto += `┗━━━━━━━━━━━━━━━━━━━━┛\n`
  texto += `🖤 ➺ ${usedPrefix}mapa bermuda\n`
  texto += `🖤 ➺ ${usedPrefix}mapa purgatorio\n`
  texto += `🖤 ➺ ${usedPrefix}mapa kalahari\n`
  texto += `🖤 ➺ ${usedPrefix}mapa nexterra\n`
  texto += `🖤 ➺ ${usedPrefix}mapa alpes\n\n`

  texto += `┏━━━━━━━━━━━━━━━━━━━━┓\n`
  texto += `┃ ⚔️ *LISTA DE VERSUS*\n`
  texto += `┗━━━━━━━━━━━━━━━━━━━━┛\n`
  texto += `⚔ ➺ .4vs4 | .6vs6 | .8vs8\n`
  texto += `⚔ ➺ .12vs12 | .16vs16\n`
  texto += `⚔ ➺ .20vs20 | .24vs24\n`
  texto += `⚔ ➺ .scrim\n\n`

  texto += `*◈────────── • ☄️ • ──────────◈*\n`
  texto += `📢 [Canal Oficial](https://whatsapp.com/channel/0029Vb8kvXUBfxnzYWsbS81I)\n`
  texto += `✨ 𝑺𝒂𝒔𝒖𝒌𝒆 𝑩𝒐𝒕 | 𝑳𝒂 𝒗𝒐𝒛 𝒅𝒆𝒍 𝑰𝒏𝒇ِي𝒆𝒓𝒏𝒐 ✨`

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

  await conn.sendMessage(m.chat, { image: (typeof img === 'string' ? { url: img } : img), caption: texto }, { quoted: fkontak })
}

handler.help = ['menuff']
handler.tags = ['freefire', 'main']
handler.command = /^(menuff|menufreefire|ffmenu)$/i
handler.register = true

export default handler
