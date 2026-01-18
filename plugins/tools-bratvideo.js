import fetch from "node-fetch"
import { sticker } from '../lib/sticker.js'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) return conn.reply(m.chat, `❀ *Formato en inglés:*\n${usedPrefix + command} texto | color | fondo | tipo\n\n*Ejemplo:*\n${usedPrefix + command} Hello | white | black | Jose`, m)
        
        await m.react('🕒')

        let [txt, color, fondo, tipo] = text.split('|').map(v => v.trim())

        let textoFinal = txt
        let letraFinal = color || 'white'
        let fondoFinal = fondo || 'black'
        let tipoFinal = tipo || 'Jose'
        let apiKey = 'sylphy-6f150d'

        let apiUrl = `https://sylphy.xyz/tools/brat?text=${encodeURIComponent(textoFinal)}&color=${encodeURIComponent(letraFinal)}&fondo=${encodeURIComponent(fondoFinal)}&type=${encodeURIComponent(tipoFinal)}&api_key=${apiKey}`

        const res = await fetch(apiUrl)
        
        if (!res.ok) throw 'Error'
        
        const buffer = await res.buffer()
        const stiker = await sticker(buffer, false, 'Brat Bot', 'S-Bot')

        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'brat.webp', '', m)
            await m.react('✅')
        }

    } catch (e) {
        await m.react('✖️')
        conn.reply(m.chat, `⚠︎ Error. Ejemplo: ${usedPrefix + command} Hello | white | black | Jose`, m)
    }
}

handler.command = /^(brat|sbrat)$/i
export default handler
