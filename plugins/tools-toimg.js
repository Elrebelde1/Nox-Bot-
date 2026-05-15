import { webp2png } from '../lib/webp2mp4.js'

let handler = async (m, { conn, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted : m
    let mime = q.mediaType || (q.msg || q).mimetype || ''

    if (!/sticker/.test(mime)) {
        return conn.reply(m.chat, `🌀 Debes citar un *sticker* para convertirlo a imagen.`, m)
    }

    await m.react('🕒')

    try {
        let media = await q.download()
        if (!media) throw new Error()

        let out = await webp2png(media).catch(_ => null) || media

        await conn.sendMessage(m.chat, { 
            image: typeof out === 'string' ? { url: out } : out, 
            caption: '💯 *Aquí tienes pendejo*' 
        }, { quoted: m })

        await m.react('✔️')

    } catch (e) {
        await m.react('✖️')
    }
}

handler.help = ['toimg']
handler.tags = ['tools']
handler.command = ['toimg', 'jpg', 'img'] 

export default handler
