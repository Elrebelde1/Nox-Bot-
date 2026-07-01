import fetch from 'node-fetch'
let handler = async (m, { conn, text }) => {
  if (!text) return m.reply('Escribe algo para hablar con Gemini.')
  await m.react('⏳')
  let key = Buffer.from('c2FzdWtl', 'base64').toString('utf-8')
  let res = await fetch(`https://api.evogb.org/ai/gemini?text=${encodeURIComponent(text)}&prompt=V&key=${key}`)
  let json = await res.json()
  if (json.status) {
    await m.react('✅')
    m.reply(json.result)
  } else {
    await m.react('❌')
  }
}
handler.help = ['gemini <texto>']
handler.tags = ['inteligencia artificial']
handler.command = ['gemini']
export default handler
