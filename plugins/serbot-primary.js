import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted.text : text
    if (!q) return m.reply(`⚠️ Responde a un texto o escribe algo para convertirlo en voz.\n\n> Ejemplo: *${usedPrefix + command}* Hola gey`)

    await m.react('⏳')

    try {
        const api = `https://yosoyyo-api-ofc.onrender.com/api/tts?text=${encodeURIComponent(q)}&apiKey=yosoyyo_sk_cq1h5ccx`
        const res = await axios.get(api)
        
        // Fíjate en la estructura del JSON: data -> audio_url
        if (res.data.status === 200) {
            let vn = res.data.data.audio_url
            
            await conn.sendMessage(m.chat, { 
                audio: { url: vn }, 
                fileName: 'audio.mp3', 
                mimetype: 'audio/mpeg', 
                ptt: true 
            }, { quoted: m })
            
            await m.react('✅')
        } else {
            m.reply('❌ Error en el servidor de voz.')
        }
    } catch (e) {
        console.error(e)
        m.reply('❌ Fallo al conectar con la API.')
    }
}

handler.help = ['voz <texto>']
handler.tags = ['tools']
handler.command = /^voz|tts|decir$/i

export default handler
