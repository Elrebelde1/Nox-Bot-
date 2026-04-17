import { sticker } from '../lib/sticker.js';
import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*${usedPrefix + command}* <texto>`, m)

    try {
        if (m.react) m.react('⌛')

        const apiUrl = `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(text)}&color=Negro&fondo=Blanco&type=Anim&api_key=sylphy-6f150d`

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data)

        let stiker = await sticker(buffer, false, global.botname || 'BratBot', global.nombre || 'Sebastián')

        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'sticker.webp', '', m)
            if (m.react) m.react('✅')
        } else {
            throw new Error()
        }

    } catch (error) {
        console.error(error)
        if (m.react) m.react('❌')
        return conn.reply(m.chat, `*Error:* ${error.message}`, m)
    }
}

handler.command = ['bratv']
handler.tags = ['sticker']
handler.help = ['bratv']

export default handler