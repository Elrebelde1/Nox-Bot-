import fetch from "node-fetch"
import { sticker } from '../lib/sticker.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) return conn.reply(m.chat, `❀ Por favor, escribe el texto que deseas convertir en sticker.\n\nEjemplo: *${usedPrefix + command}* Texto aquí`, m)
        
        await m.react('🕒')

        const apiKey = 'sylphy-6f150d'
        const apiUrl = `https://sylphy.xyz/tools/brat?text=${encodeURIComponent(text)}&color=white&fondo=black&api_key=${apiKey}`

        const res = await fetch(apiUrl)
        
        if (!res.ok) throw 'Error al conectar con el servidor de diseño.'
        
        const buffer = await res.buffer()
        const stiker = await sticker(buffer, false, 'Brat Sticker', 'Bot')

        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'brat.webp', '', m)
            await m.react('✅')
        } else {
            throw 'No se pudo procesar el sticker.'
        }

    } catch (e) {
        await m.react('✖️')
        conn.reply(m.chat, `⚠︎ Ocurrió un fallo al generar el sticker.`, m)
    }
}

handler.command = /^(brat|sbrat)$/i
handler.tags = ['sticker']
handler.help = ['brat <texto>']

export default handler
