import fetch from 'node-fetch'
let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Escribe algo para hablar con GPT-4.')
  await m.react('⏳')
  let res = await fetch(`https://api.evogb.org/ai/gpt4-session?text=${encodeURIComponent(text)}&session=12&key=sasuke`)
  let json = await res.json()
  if (json.status) {
    await m.react('✅')
    m.reply(json.result)
  } else {
    await m.react('❌')
  }
}
handler.help = ['gpt4 <texto>']
handler.tags = ['inteligencia artificial']
handler.command = ['gpt4']
export default handler
