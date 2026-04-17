let handler = async (m, { conn, command }) => {
  const canal1 = "https://whatsapp.com/channel/0029Vb8kvXUBfxnzYWsbS81I"
  const canal2 = "https://whatsapp.com/channel/0029VbBbaFCAO7RL7UEhBD2F"

  if (command === 'canal1') {
    let txt = `✨ *¡Hola! No olvides seguir nuestro canal principal para todas las novedades de Sasuke Bot.* 👤⚡\n\n🔗 *Únete aquí:* ${canal1}`
    await conn.reply(m.chat, txt, m)
  }

  if (command === 'canal2') {
    let txt = `🚀 *¡Ey! Te invitamos a formar parte de nuestra comunidad oficial de apoyo.* ⚡\n\n🔗 *Únete aquí:* ${canal2}`
    await conn.reply(m.chat, txt, m)
  }
}

handler.command = ['canal1', 'canal2']
export default handler
