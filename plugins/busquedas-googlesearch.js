import google from 'google-it'
let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('✨ ¿Qué deseas buscar en Google?')
    await m.react('🔍')
    try {
        let res = await google({ query: text })
        let txt = `*Nox Bot 🌃 - Google Search*\n\n` + res.slice(0, 5).map(v => `*${v.title}*\n${v.snippet}\n🔗 ${v.link}`).join('\n\n')
        m.reply(txt)
        await m.react('✅')
    } catch { await m.react('❌') }
}
handler.help = ['google <texto>']
handler.tags = ['search']
handler.command = /^google$/i
export default handler
