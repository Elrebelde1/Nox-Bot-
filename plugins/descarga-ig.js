import axios from 'axios'
let handler = async (m, { conn, text }) => {
    if (!text) return conn.reply(m.chat, 'Ingresa un enlace de Instagram', m)
    await m.react('⏳')
    try {
        const key = Buffer.from('ZWt1c2Fz', 'base64').toString('utf-8').split('').reverse().join('')
        const { data } = await axios.get(`https://api.evogb.org/dl/instagram?url=${encodeURIComponent(text)}&key=${key}`)
        if (!data.status) return m.reply('Error al procesar.')
        await conn.sendMessage(m.chat, { video: { url: data.data[0].url }, mimetype: 'video/mp4' }, { quoted: m })
        await m.react('✅')
    } catch {
        await m.react('❌')
    }
}
handler.command = /^(ig|instagram)$/i
export default handler
