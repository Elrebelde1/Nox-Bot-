/**
 * 📂 COMANDO: Uchiha Global Downloader PRO
 * 📝 DESCRIPCIÓN: Scraper directo de VidsSave con limpieza de URL.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔗 SOURCE: https://vidssave.com
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "𝘽𝙮 𝘽𝙖𝙧𝙗𝙤𝙯𝙖"
    const chn = "𝙕𝙤𝙣𝙖 𝘿𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙧𝙨"

    // Limpieza de texto (extrae solo el link si el usuario pega todo el mensaje de TikTok)
    const urlRegex = /https?:\/\/[^\s]+/g
    const urlMatch = text.match(urlRegex)
    const inputUrl = urlMatch ? urlMatch[0] : null

    if (!inputUrl) return conn.reply(m.chat, `*✨ Ingresa un link válido*\n*Ejemplo:* ${usedPrefix + command} https://vt.tiktok.com/ZS...`, m)

    if (m.react) await m.react('⏳')

    try {
        const response = await fetch("https://vidssave.com/ajax.php", {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "user-agent": "Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
                "referer": "https://vidssave.com/",
                "x-requested-with": "XMLHttpRequest"
            },
            body: `url=${encodeURIComponent(inputUrl)}`
        })

        const data = await response.json()

        if (!data || data.status !== "success" || !data.links || data.links.length === 0) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '🛑 El servidor no pudo procesar este link. Intenta con otro.', m)
        }

        // Selecciona la mejor calidad disponible
        const videoUrl = data.links[0].url
        const titulo = data.title || "Uchiha Video"

        let caption = `「 📥 𝚄𝙲𝙷𝙸𝙷𝙰 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 」\n`
        caption += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        caption += `│ 📌 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${titulo}\n`
        caption += `│ ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${data.duration || 'N/A'}\n`
        caption += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        caption += `⚡ *Code creado por ${dev}*\n`
        caption += `📡 *Disfruta el código de ${dev} x ${chn}*`

        await conn.sendMessage(m.chat, { 
            video: { url: videoUrl }, 
            caption: caption 
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (error) {
        if (m.react) await m.react('❌')
        console.error(error)
        conn.reply(m.chat, '⚠️ Error de conexión. El sitio vidssave.com podría estar caído o bloqueando la IP.', m)
    }
}

handler.help = ['dl <url>']
handler.tags = ['downloader']
handler.command = /^(vidsave|dl|descargar|global)$/i

export default handler
