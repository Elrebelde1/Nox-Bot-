let handler = async (m, { conn }) => {
  let txt = `✨ *¡Hola! Me harías muy feliz si sigues nuestros canales oficiales de Sasuke Bot MD.* 👤⚡\n\n`
  txt += `📢 *Canal Principal:* \nhttps://whatsapp.com/channel/0029Vb8kvXUBfxnzYWsbS81I\n\n`
  txt += `🚀 *Canal de Respaldo:* \nhttps://whatsapp.com/channel/0029VbBbaFCAO7RL7UEhBD2F\n\n`
  txt += `*By Barboza-Team* ⚡`
  
  await conn.reply(m.chat, txt, m)
}

// Comando único para el botón del sticker
handler.command = ['scanal']
export default handler
