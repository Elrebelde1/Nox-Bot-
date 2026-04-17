let handler = async (m, { conn }) => {
  let txt = `✨ *¡Uchiha! Para estar al tanto de las actualizaciones de música y videos en Sasuke Bot MD, sigue nuestros canales:* 👤⚡\n\n`
  txt += `📢 *Canal 1:* \nhttps://whatsapp.com/channel/0029Vb8kvXUBfxnzYWsbS81I\n\n`
  txt += `🚀 *Canal 2:* \nhttps://whatsapp.com/channel/0029VbBbaFCAO7RL7UEhBD2F\n\n`
  txt += `*By Barboza-Team* ⚡`
  
  await conn.reply(m.chat, txt, m)
}

handler.command = ['ycanal']
export default handler
