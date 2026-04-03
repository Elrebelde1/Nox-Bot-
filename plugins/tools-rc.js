import fetch from 'node-fetch'

let handler = async (m, { args, usedPrefix, command }) => {
  // Validación de argumentos
  if (!args[0] || !args[1]) {
    return m.reply(`👻 *Uso correcto:* ${usedPrefix + command} <link_canal> <emojis>

*Ejemplo:* ${usedPrefix + command} https://whatsapp.com/channel/0029VbArz9fAO7RGy2915k3O/779 😨,🤣,🔥`)
  }

  await m.react('🕒')

  try {
    const postLink = args[0]
    // Unimos el resto de argumentos y limpiamos espacios
    const reacts = args.slice(1).join('').split(',').filter(e => e.trim())

    if (!postLink.includes('whatsapp.com/channel/')) {
      return m.reply('🍄 El link debe ser de un canal de WhatsApp válido.')
    }

    if (reacts.length > 10) return m.reply('👻 Máximo 10 emojis permitidos.')

    // Endpoint actualizado y API Key (Si esta falla, el servicio es el que está caído)
    const url = `https://asitha.top/api/helper/channel-react`
    const apiKey = '7h7FjNZGZ54KJzUtvx2eS9u61HbPX8XZS8WjyQtrpump' 

    const response = await fetch(`${url}?url=${postLink}&react=${reacts.join(',')}&apikey=${apiKey}`)
    const result = await response.json()

    // Manejo de respuestas según la estructura común de estas APIs
    if (result.status === true || result.success === true) {
      await m.react('✅')
      await m.reply(`✅ *Reacciones enviadas:* ${reacts.join(' ')}`)
    } else {
      await m.react('❌')
      await m.reply(`❌ *Error:* ${result.message || 'La API no pudo procesar las reacciones. Verifica el link.'}`)
    }

  } catch (e) {
    console.error(e)
    await m.react('❌')
    await m.reply('❌ *Error fatal:* No se pudo conectar con el servidor de reacciones.')
  }
}

handler.help = ['react']
handler.tags = ['tools']
handler.command = ['react', 'reaccionar']

export default handler
