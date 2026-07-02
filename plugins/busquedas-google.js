import axios from 'axios'
let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('✨ ¿Qué deseas buscar en Google?')
    await m.react('🔍')
    try {
        let { data } = await axios.get(`https://api.delirius.store/search/googlesearch?query=${encodeURIComponent(text)}`)
        let res = data.data.map(v => `*${v.title}*\n_${v.description}_\n🔗 ${v.url}`).join('\n\n')
        m.reply(`*Nox Bot 🌃 - Google Search*\n\n${res}`)
        await m.react('✅')
    } catch { await m.react('❌') }
}
handler.help = ['google <texto>']
handler.tags = ['search']
handler.command = /^google$/i
export default handler