import { webp2png } from '../lib/webp2mp4.js' // Asegúrate de tener esta librería o una similar

let handler = async (m, { conn, usedPrefix, command }) => {
    // 1. Validar que se esté citando un sticker
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''
    
    if (!/sticker/.test(mime)) {
        return conn.reply(m.chat, `🌀 Debes citar un **sticker** para convertirlo a imagen.`, m)
    }

    await m.react('🕒')

    try {
        // 2. Descargar el sticker
        let media = await q.download()
        if (!media) throw new Error('No se pudo descargar el sticker')

        // 3. Convertir WebP a PNG/JPG (Opcional pero recomendado para compatibilidad)
        // Si tu bot no tiene webp2png, puedes intentar enviarlo directo, 
        // pero algunos stickers animados (WA-WebP) fallarán sin conversión.
        let out = await webp2png(media).catch(_ => null) || media

        // 4. Enviar la imagen resultante
        await conn.sendMessage(m.chat, { 
            image: typeof out === 'string' ? { url: out } : out, 
            caption: '💯 *Aquí tienes pendejo*' 
        }, { quoted: m })

        await m.react('✔️')

    } catch (e) {
        console.error(e)
        await m.react('✖️')
        await conn.reply(m.chat, `💥 Ocurrió un error al convertir: ${e.message}`, m)
    }
}

handler.help = ['toimg']
handler.tags = ['tools']
handler.command = ['toimg', 'jpg', 'img'] 

export default handler
