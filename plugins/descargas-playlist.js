import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*¡Hola!* Ingresa el enlace de YouTube.\n\n*Ejemplo:* ${usedPrefix}${command} https://youtu.be/5M_n2UCe7DQ`, m)

    await m.react('⏳')

    try {
        const { data } = await axios.get(`https://api.delirius.store/download/ytmp3?url=${text}`)

        if (!data.status || !data.data) throw new Error()

        const { title, author, image, download } = data.data

        const info = `*〔 YOUTUBE MP3 〕*\n\n*Título:* ${title}\n*Canal:* ${author}\n\n_Enviando archivo de audio..._`

        await conn.sendMessage(m.chat, { 
            image: { url: image }, 
            caption: info 
        }, { quoted: m })

        await conn.sendMessage(m.chat, { 
            audio: { url: download }, 
            mimetype: 'audio/mpeg', 
            fileName: `${title}.mp3` 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        await conn.reply(m.chat, `⚠️ No se pudo procesar la descarga.`, m)
    }
}

handler.help = ['ytmp3']
handler.tags = ['descargas']
handler.command = ['ytmp2', 'audio']

export default handler
