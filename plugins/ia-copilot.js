import fetch from 'node-fetch'
let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Escribe algo para hablar con Copilot.')
  await m.react('⏳')
  let key = Buffer.from('c2FzdWtl', 'base64').toString('utf-8')
  let res = await fetch(`https://api.evogb.org/ai/copilot?text=${encodeURIComponent(text)}&key=${key}`)
  let json = await res.json()
  if (json.status) {
    await m.react('✅')
    m.reply(json.response)
  } else {
    await m.react('❌')
  }
}
handler.help = ['copilot <texto>']
handler.tags = ['inteligencia artificial']
handler.command = ['copilot']
export default handler
