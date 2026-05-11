import fetch from 'node-fetch'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `❌ ¡Falta el enlace de TikTok!`
    let cleanUrl = text.split('?')[0]
    if (!cleanUrl.match(/(tiktok\.com\/|vt\.tiktok\.com\/)/i)) throw `🤔 Enlace no válido.`

    try {
        m.react("🔄")
        const res = await fetch(`https://www.tikwm.com/api/?url=${cleanUrl}`)
        const json = await res.json()
        if (!json.data) throw 'Error al obtener datos.'

        const data = json.data
        const hashtags = data.title.match(/#[\wñ]+/g)?.join(' ') || '#viral #tiktok'

        let mensaje = `
┏━━━━━━━━━━━━━━┓
┃     📥 DESCARGADOR |
┗━━━━━━━━━━━━━━┛

📝 *INFO:* ${hashtags}

━━━━━━━━━━━━━━━━
🎥 *OPCIONES:*
👉 *Video HD:* ${usedPrefix}ttvideo ${cleanUrl}
👉 *Solo Audio:* ${usedPrefix}ttaudio ${cleanUrl}

━━━━━━━━━━━━━━━━
⚡ *By: Barboza Developer*`.trim()

        await conn.sendMessage(m.chat, { 
            video: { url: data.play }, 
            caption: mensaje 
        }, { quoted: m })
        m.react("✅")

    } catch (e) {
        m.reply('❌ Error de conexión.')
    }
}

handler.help = ['tiktok <url>']
handler.tags = ['dl']
handler.command = /^(tiktok|tt)$/i
export default handler
