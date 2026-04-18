let handler = async (m, { conn, text }) => {
  const canal1 = "https://whatsapp.com/channel/0029Vb8kvXUBfxnzYWsbS81I"
  const canal2 = "https://whatsapp.com/channel/0029VbBbaFCAO7RL7UEhBD2F"

  // Detecta el ID del botón presionado
  let id = text || m.text

  if (id === 'sask_c1') {
    let txt = `✨ *¡Hola! No olvides seguir nuestro canal oficial para estar al tanto de cada actualización.* 👤⚡\n\n🔗 *Canal Principal:* ${canal1}\n\n> 𝖡𝗒 𝖡𝖺𝗋𝖻𝗈𝗓𝖺-𝖳𝖾𝖺𝗆 ⚡`
    await conn.reply(m.chat, txt, m)
  }

  if (id === 'sask_c2') {
    let txt = `🚀 *¿Necesitas ayuda o quieres conocer a la comunidad? Únete a nuestro canal de soporte.* ⚡\n\n🔗 *Canal de Soporte:* ${canal2}\n\n> 𝖡𝗒 𝖡𝖺𝗋𝖻𝗈𝗓𝖺-𝖳𝖾𝖺𝗆 ⚡`
    await conn.reply(m.chat, txt, m)
  }
}

handler.command = ['sask_c1', 'sask_c2']
export default handler
