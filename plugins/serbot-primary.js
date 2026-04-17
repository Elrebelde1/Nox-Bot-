import axios from 'axios'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted.text : text
    if (!q) return m.reply(`⚠️ Responde a un texto o escribe algo.\n\n> Ejemplo: *${usedPrefix + command}* Hola gey`)

    await m.react('⏳')

    try {
        // Importante: Mandamos el texto y la API Key
        const url = `https://yosoyyo-api-ofc.onrender.com/api/tts?text=${encodeURIComponent(q)}&apiKey=yosoyyo_sk_cq1h5ccx`
        
        // Pedimos la respuesta como buffer porque es STREAMING_BYTES_LOCAL
        const res = await axios.get(url, { responseType: 'arraybuffer' })
        
        // Si hay datos, los enviamos directamente
        if (res.data) {
            await conn.sendMessage(m.chat, { 
                audio: res.data, 
                mimetype: 'audio/mpeg', 
                ptt: true 
            }, { quoted: m })
            
            await m.react('✅')
        } else {
            m.reply('❌ No se recibieron bytes de audio.')
        }
    } catch (e) {
        console.error(e)
        m.reply('❌ Error al obtener los bytes del servidor.')
    }
}

handler.help = ['voz <texto>']
handler.tags = ['tools']
handler.command = /^voz|tts|decir$/i

export default handler
