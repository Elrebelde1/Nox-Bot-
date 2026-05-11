import fetch from 'node-fetch'

const handler = async (m, { conn, text, command }) => {
    if (!text) return
    m.react("⏳")
    
    try {
        const res = await fetch(`https://www.tikwm.com/api/?url=${text}`)
        const json = await res.json()
        if (!json.data) throw 'Error.'

        if (command === 'ttvideo') {
            const videoHd = json.data.hdplay || json.data.play
            await conn.sendMessage(m.chat, { video: { url: videoHd }, caption: `✅ *TIKTOK HD LISTO*` }, { quoted: m })
        } 
        
        if (command === 'ttaudio') {
            await conn.sendMessage(m.chat, { 
                audio: { url: json.data.music }, 
                mimetype: 'audio/mp4', 
                fileName: 'tiktok.mp3' 
            }, { quoted: m })
        }
        m.react("✅")
    } catch (e) {
        m.reply('❌ Error al procesar el archivo.')
    }
}

handler.command = /^(ttvideo|ttaudio)$/i
export default handler
