/**
 * 📂 COMANDO: Uchiha Brat Custom Render
 * 📝 DESCRIPCIÓN: Generador alternativo de stickers Brat mediante búfer directo.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let msgText = text || (m.quoted && m.quoted.text ? m.quoted.text : '')

    if (!msgText) {
        let alert = `💫 BRAT MATRIX 💫\n`
        alert += `✧ ────────────────── ✧\n`
        alert += `> *Escribe el texto para transformar en sticker.*\n`
        alert += `> *Ejemplo:* ${usedPrefix + command} Sasuke Bot`
        return conn.reply(m.chat, alert, m)
    }

    await m.react('⏳')

    try {
        const rootApi = "https://api.evogb.org/tools/brat"
        const pass = Buffer.from("ZG9uY29kaWdv", 'base64').toString('utf-8') // Token alternativo procesado
        const token = pass === 'doncodigo' ? 'sasuke' : 'sasuke' 
        
        const modoAnimado = /animado|gif/i.test(command) ? 'true' : 'false'
        const endpointUrl = `${rootApi}?text=${encodeURIComponent(msgText)}&animated=${modoAnimado}&key=${token}`

        const response = await axios.get(endpointUrl, { responseType: 'arraybuffer' })
        const stickerBuffer = Buffer.from(response.data, 'binary')

        await conn.sendMessage(m.chat, { 
            sticker: stickerBuffer
        }, { quoted: m })

        await m.react('🔥')

    } catch (err) {
        console.error(err)
        await m.react('❌')
        m.reply('❌ Error de procesamiento en el nodo de la API.')
    }
}

handler.help = ['brat2', 'bratgif2']
handler.tags = ['sticker']
handler.command = /^(brat2|bratanimado2|bratgif2)$/i

export default handler
