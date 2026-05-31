import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let contenido = text || (m.quoted && m.quoted.text ? m.quoted.text : '')

    if (!contenido) {
        let alert = `💚 BRAT DESIGNER 💚\n`
        alert += `✧ ────────────────── ✧\n`
        alert += `> *Escribe el texto que llevará el sticker.*\n`
        alert += `> *Uso:* ${usedPrefix + command} Vete a la verga`
        return conn.reply(m.chat, alert, m)
    }

    await m.react('⏳')

    try {
        const principalApi = "https://api.evogb.org/tools/brat"
        const estadoAnimacion = /animado|gif/i.test(command) ? 'true' : 'false'
        
        const rutaDirecta = `${principalApi}?text=${encodeURIComponent(contenido)}&animated=${estadoAnimacion}`

        const peticion = await axios.get(rutaDirecta, { responseType: 'arraybuffer' })
        const finalSticker = Buffer.from(peticion.data, 'binary')

        await conn.sendMessage(m.chat, { 
            sticker: finalSticker
        }, { quoted: m })

        await m.react('🔥')

    } catch (error) {
        console.error(error)
        await m.react('❌')
        m.reply('❌ Error en el flujo de renderizado de la API.')
    }
}

handler.help = ['brat3', 'bratgif3']
handler.tags = ['sticker']
handler.command = /^(brat3|bratanimado3|bratgif3)$/i

export default handler
