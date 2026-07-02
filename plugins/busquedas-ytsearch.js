
import axios from 'axios'
let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('✨ ¿Qué deseas buscar en YouTube?')
    await m.react('📺')
    try {
        let { data } = await axios.get(`https://api.delirius.store/search/ytsearch?q=${encodeURIComponent(text)}`)
        let res = data.data.slice(0, 5).map(v => `*${v.title}*\n🕒 ${v.duration} | 👁️ ${v.views}\n🔗 ${v.url}`).join('\n\n')
        m.reply(`*Nox Bot 🌃 - YouTube Search*\n\n${res}`)
        await m.react('✅')
    } catch { await m.react('❌') }
}
handler.help = ['yts <busqueda>']
handler.tags = ['search']
handler.command = /^(yts|ytsearch)$/i
export default handler