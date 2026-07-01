import { sticker } from '../lib/sticker.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || q.mediaType || ''
    if (!/webp|image|video/g.test(mime)) return m.reply(`Responde a una imagen, video o gif para convertirlo en sticker.`)
    let img = await q.download()
    let stiker = await sticker(img, false, 'Box Bot MD', 'Barboza')
    conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
}
handler.help = ['s']
handler.tags = ['sticker']
handler.command = ['s', 'sticker', 'stiker']
export default handler
