import fetch from 'node-fetch'

let handler = async (m, { args, usedPrefix, command }) => {
  if (!args[0] || !args[1]) {
    return m.reply(`👻 *Uso correcto:* ${usedPrefix + command} <link_canal> <emojis>\n\n*Ejemplo:* ${usedPrefix + command} https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O/779 🔥,😂,❤️`)
  }

  await m.react('🕒')

  try {
    const postLink = args[0]
    const emojis = args.slice(1).join('').split(',').map(e => e.trim()).filter(e => e)

    // Usaremos un servidor espejo que suele estar más tiempo activo
    // Si este falla, es que el método global de reacciones por API está caído
    const api = `https://api.agungdev.my.id/api/whatsapp/channel-react?url=${encodeURIComponent(postLink)}&text=${encodeURIComponent(emojis.join(','))}`

    const response = await fetch(api)
    
    // Si el servidor no responde (404, 500, etc)
    if (!response.ok) throw new Error('Servidor fuera de línea')

    const result = await response.json()

    if (result.status === true || result.result === 'Success') {
      await m.react('✅')
      await m.reply(`✅ *Reacciones enviadas correctamente.*`)
    } else {
      await m.react('❌')
      await m.reply(`❌ *La API respondió:* ${result.message || 'No se pudo reaccionar. Verifica que el canal sea público.'}`)
    }

  } catch (e) {
    console.error(e)
    await m.react('❌')
    await m.reply('⚠️ *Error de conexión:* El servidor de reacciones está caído actualmente. Intenta de nuevo más tarde o busca un nuevo endpoint.')
  }
}

handler.help = ['react']
handler.tags = ['tools']
handler.command = ['react', 'reaccionar']

export default handler
