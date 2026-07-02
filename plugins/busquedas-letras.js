
import axios from 'axios'
let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('✨ Ingresa el nombre de la canción')
    await m.react('🎵')
    try {
        let { data } = await axios.get(`https://api.delirius.store/search/lyrics?query=${encodeURIComponent(text)}`)
        let res = data.data
        let txt = `*Nox Bot 🌃 - Letra*\n\n*Título:* ${res.title}\n*Artista:* ${res.artists}\n\n${res.lyrics}`
        m.reply(txt)
        await m.react('✅')
    } catch { await m.react('❌') }
}
handler.help = ['letra <cancion>']
handler.tags = ['tools']
handler.command = /^(letra|lyrics)$/i
export default handler