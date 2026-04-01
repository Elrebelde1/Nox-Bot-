import { sticker } from '../lib/sticker.js'
import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*¡Te falta el texto!* ✍️\n\nUso: _${usedPrefix + command} Hola Mundo_`, m)

    try {
        // Mostramos reacción de espera
        m.react('⌛')

        // Construimos la URL con los parámetros que pasaste
        // type=Anim es lo que genera el movimiento
        const apiUrl = `https://sylphy.xyz/tools/brat?text=${encodeURIComponent(text)}&color=Negro&fondo=Blanco&type=Anim&api_key=sylphy-6f150d`

        // Obtenemos el buffer del video/gif generado
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data)

        // Generamos el sticker a partir del buffer
        // El parámetro 'false' es para que no sea estático si detecta animación
        let stiker = await sticker(buffer, false, global.packname, global.author)

        if (stiker) {
            await conn.sendFile(m.chat, stiker, 'brat.webp', '', m)
            m.react('✅')
        } else {
            throw new Error("No se pudo procesar la animación del sticker.")
        }

    } catch (e) {
        console.error(e)
        m.react('❌')
        conn.reply(m.chat, `*Ocurrió un error:* ${e.message}`, m)
    }
}

handler.help = ['bratv <texto>']
handler.tags = ['sticker']
handler.command = ['bratv', 'bratanim']

export default handler
