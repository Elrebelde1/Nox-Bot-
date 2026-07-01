import fetch from 'node-fetch'
let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Escribe algo para hablar con Claude.')
  await m.react('⏳')
  let key = Buffer.from('c2FzdWtl', 'base64').toString('utf-8')
  let res = await fetch(`https://api.evogb.org/ai/claude?text=${encodeURIComponent(text)}&key=${key}`)
  let json = await res.json()
  if (json.status) {
    await m.react('✅')
    m.reply(json.result)
  } else {
    await m.react('❌')
  }
}
handler.help = ['claude <texto>']
handler.tags = ['inteligencia artificial']
handler.command = ['claude']
export default handler
