import { readFileSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix }) => {
  // Ruta de imagen de tu catálogo
  const img = readFileSync(join(process.cwd(), 'storage', 'img', 'catalogo.png'))
  
  let menu = `┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚖️  𝙈𝙀𝙉𝙐 𝘼𝘿𝙑𝙀𝙍𝙏𝙀𝙉𝘾𝙄𝘼𝙎  ⚖️  ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

⚖️ *${usedPrefix}𝙬𝙖𝙧𝙣 | .𝙖𝙙𝙫𝙚𝙧𝙩𝙞𝙧 | .𝙖𝙙𝙫*
⚖️ *${usedPrefix}𝙬𝙖𝙧𝙣𝙡𝙞𝙨𝙩 | .𝙖𝙙𝙫𝙚𝙧𝙩𝙚𝙣𝙘𝙞𝙖𝙨 | .𝙡𝙞𝙨𝙩𝙬𝙖𝙧𝙣*
⚖️ *${usedPrefix}𝙙𝙚𝙡𝙬𝙖𝙧𝙣 | .𝙪𝙣𝙬𝙖𝙧𝙣 | .𝙦𝙪𝙞𝙩𝙖𝙧𝙬𝙖𝙧𝙣*
⚖️ *${usedPrefix}𝙙𝙚𝙡𝙬𝙖𝙧𝙣 𝙖𝙡𝙡*
⚖️ *${usedPrefix}𝙬𝙖𝙧𝙣𝙡𝙞𝙢𝙞𝙩 | .𝙨𝙚𝙩𝙬𝙖𝙧𝙣*
⚖️ *${usedPrefix}𝙬𝙖𝙧𝙣𝙧𝙚𝙨𝙚𝙩 | .𝙧𝙚𝙨𝙚𝙩𝙬𝙖𝙧𝙣*

*─── [ 🛡️ 𝙎𝙄𝙎𝙏𝙀𝙈𝘼 𝙎𝘼𝙎𝙐𝙆𝙀 ] ───*

🛡️ *𝘽𝙮𝙥𝙖𝙨𝙨:* Admins y Bot son inmunes.
✨ *𝘼𝙪𝙩𝙤-𝙍𝙚𝙨𝙚𝙩:* Se perdona 1 falta cada 24h.
⚖️ *𝙇𝙞𝙢𝙞𝙩𝙚:* Configurable de 1 a 10 faltas.

👤 *𝙎𝙚𝙗𝙖𝙨𝙩𝙞𝙖́𝙣 𝘽𝙖𝙧𝙗𝙤𝙯𝙖*
🚀 *𝙎𝙖𝙨𝙪𝙠𝙚 𝘽𝙤𝙩 - 𝙎𝙠𝙮 𝙐𝙡𝙩𝙧𝙖 𝙋𝙡𝙪𝙨*`

  await conn.sendMessage(m.chat, {
    image: img,
    caption: menu,
    contextInfo: {
      externalAdReply: {
        title: 'Sᴀsᴜᴋᴇ Bᴏᴛ ─ Wᴀʀɴ Sʏsᴛᴇᴍ ᴠ2',
        body: 'Control de Moderación Avanzada',
        mediaType: 1,
        showAdAttribution: true,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })
}

handler.help = ['menuwarn']
handler.tags = ['group']
handler.command = /^(menuwarn|warnmenu)$/i
handler.group = true

export default handler
