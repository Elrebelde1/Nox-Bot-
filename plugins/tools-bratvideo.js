import fetch from "node-fetch"
import { sticker } from '../lib/sticker.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) return conn.reply(m.chat, `❀ *Uso Correcto:*\n${usedPrefix + command} texto | color | fondo | tipo\n\n*Ejemplo:*\n${usedPrefix + command} Barbosa | Blanco | Negro | José`, m)
        
        await m.react('🕒')

        let [txt, color, fondo, tipo] = text.split('|').map(v => v.trim())

        let textoFinal = txt
        let letraFinal = color || 'Blanco'
        let fondoFinal = fondo || 'Negro'
        let tipoFinal = tipo || 'José'
        let apiKey = 'sylphy-6f150d'

        let apiUrl = `https://sylphy.xyz/tools/brat?text=${encodeURIComponent(textoFinal)}&color=${encodeURIComponent(letraFinal)}&fondo=${encodeURIComponent(fondoFinal)}&type=${encodeURIComponent(tipoFinal)}&api_key=${apiKey}`

        const res = await fetch(apiUrl)
        
        if (!res.ok) throw 'Error al conectar con Sylphy API'
        
        const buffer = await res.buffer()
        
        const stiker = await sticker(buffer, false, global.packname || 'Brat', global.author || 'Bot')

        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'brat.webp', '', m)
            await m.react('✅')
        }

    } catch (e) {
        await m.react('✖️')
        conn.reply(m.chat, `⚠︎ *Error al generar el sticker*\n\nIntenta con:\n${usedPrefix + command} ${text || 'Barbosa'} | Blanco | Negro | José`, m)
    }
}

handler.command = /^(brat|brat2)$/i
export default handler
