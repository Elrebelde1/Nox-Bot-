import { readFileSync } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix }) => {
  const img = readFileSync(join(process.cwd(), 'storage', 'img', 'catalogo.png'))
  
  let menu = `┏━━━━━━━━━━━━━━━━━━━━━┓
┃  ⚖️  𝙈𝙀𝙉𝙐 𝘼𝘿𝙑𝙀𝙍𝙏𝙀𝙉𝘾𝙄𝘼𝙎  ⚖️  ┃
┗━━━━━━━━━━━━━━━━━━━━━┛

⚖️ *${usedPrefix}𝙬𝙖𝙧𝙣 | .𝙖𝙙𝙫𝙚𝙧𝙩𝙞𝙧*
⚖️ *${usedPrefix}𝙬𝙖𝙧𝙣𝙡𝙞𝙨𝙩 | .𝙖𝙙𝙫𝙚𝙧𝙩𝙚𝙣𝙘𝙞𝙖𝙨*
⚖️ *${usedPrefix}𝙙𝙚𝙡𝙬𝙖𝙧𝙣 | .𝙦𝙪𝙞𝙩𝙖𝙧𝙬𝙖𝙧𝙣*
⚖️ *${usedPrefix}𝙙𝙚𝙡𝙬𝙖𝙧𝙣 𝙖𝙡𝙡*
⚖️ *${usedPrefix}𝙬𝙖𝙧𝙣𝙡𝙞𝙢𝙞𝙩*
⚖️ *${usedPrefix}𝙬𝙖𝙧𝙣𝙧𝙚𝙨𝙚𝙩*

> *Al llegar a las 3 advertencias el bot elimina automáticamente.*

👤 *𝙎𝙚𝙗𝙖𝙨𝙩𝙞𝙖́𝙣 𝘽𝙖𝙧𝙗𝙤𝙯𝙖*
🚀 *𝙎𝙖𝙨𝙪𝙠𝙚 𝘽𝙤𝙩 - 𝙎𝙠𝙮 𝙐𝙡𝙩𝙧𝙖 𝙋𝙡𝙪𝙨*`

  await conn.sendMessage(m.chat, {
    image: img,
    caption: menu,
    contextInfo: {
      externalAdReply: {
        title: 'Sᴀsᴜᴋᴇ Bᴏᴛ ─ Sʏsᴛᴇᴍ Wᴀʀɴ',
        body: 'Gestión de Seguridad',
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
