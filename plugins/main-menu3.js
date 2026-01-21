const handler = async (m, { isPrems, conn }) => {
  const last = global.db.data.users[m.sender].lastcofre || 0
  const now = new Date() * 1
  const cooldown = 0 

  if (now - last < cooldown) {
    const wait = msToTime((last + cooldown) - now)
    throw `⏳ El sistema está procesando datos. Vuelve en *${wait}* para generar más logos.`
  }

  const img = 'https://qu.ax/Ny958' 
  const texto = `
⚡ *𝖲𝖠𝖲𝖴𝖪𝖤 𝖫𝖮𝖦𝖮 𝖬𝖠𝖪𝖤𝖱* ⚡
––––––––––––––––––––––––––––––

_Crea diseños personalizados al instante usando los comandos de la lista._

💠 *𝖤𝖲𝖳𝖨𝖫𝖮𝖲 𝖯𝖱𝖨𝖭𝖢𝖨𝖯𝖠𝖫𝖤𝖲:*
✨ .logochristmas (texto)
👼 .logoangel (texto)
🌌 .logocielo (texto)
💖 .logocorazon (texto)
💑 .logopareja (texto)

🎮 *𝖦𝖠𝖬𝖨𝖭𝖦 & 𝖠𝖭𝖨𝖬𝖤:*
👾 .logoglitch (texto)
🎮 .logogaming (texto)
🐉 .logodragonball (texto)
🥷 .logonaruto (texto)
🎧 .logoportadaplayer (texto)
🔥 .logoportadaff (texto)
👸🔫 .logopubgfem (texto)

🎨 *𝖤𝖥𝖤𝖢𝖳𝖮𝖲 𝖵𝖨𝖲𝖴𝖠𝖫𝖤𝖲:*
💡 .logoneon (texto)
🚀 .logofuturista (texto)
✍️ .logograffiti3d (texto)
💻 .logomatrix (texto)
🎬✨ .logovideointro (texto)
☁️ .logonube (texto)

🎭 *𝖮𝖳𝖱𝖮𝖲 𝖣𝖨𝖲𝖤𝖭̃𝖮𝖲:*
🐱 .logogatito (texto)
🎖️ .logoarmy (texto)
🦅 .logoalas (texto) 
🔫 .logopubg (texto)
⚔️ .logoguerrero (texto)
👽 .logoamongus (texto)
😼 .sadcat (texto)
🐦 .tweet (comentario)

––––––––––––––––––––––––––––––
_Uso: Prefijo + comando + espacio + texto_
_Ejemplo: .logoneon SasukeBot_
`.trim()

  await conn.sendMessage(m.chat, { image: { url: img }, caption: texto }, { quoted: m })

  global.db.data.users[m.sender].lastcofre = now
}

handler.help = ['menu3']
handler.tags = ['main', 'logo']
handler.command = ['menulogos', 'logos', 'menu3'] 
handler.register = true 
export default handler

function msToTime(duration) {
  let seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor((duration / (1000 * 60 * 60)) % 24)

  hours = (hours < 10) ? "0" + hours : hours
  minutes = (minutes < 10) ? "0" + minutes : minutes
  seconds = (seconds < 10) ? "0" + seconds : seconds

  return `${hours}h ${minutes}m ${seconds}s`
}
