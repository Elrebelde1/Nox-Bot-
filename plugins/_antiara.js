/**
 * 📂 COMANDO: Uchiha Global Downloader
 * 📝 DESCRIPCIÓN: Scraper directo de VidsSave para descargar de cualquier red.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔗 SOURCE: https://vidssave.com
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "𝘽𝙮 𝘽𝙖𝙧𝙗𝙤𝙯𝙖"
    const chn = "𝙕𝙤𝙣𝙖 𝘿𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙧𝙨"

    if (!text) return conn.reply(m.chat, `*✨ Ingresa el link del video*\n*Ejemplo:* ${usedPrefix + command} https://tiktok.com/...`, m)

    if (m.react) await m.react('⏳')

    try {
        const response = await fetch("https://vidssave.com/ajax.php", {
            method: "POST",
            headers: {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "referer": "https://vidssave.com/"
            },
            body: `url=${encodeURIComponent(text)}`
        })

        const data = await response.json()

        if (!data || data.status !== "success" || !data.links || data.links.length === 0) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '🛑 No se pudo procesar este enlace.', m)
        }

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
        conn.reply(m.chat, '⚠️ Error al conectar con el servidor de descarga.', m)
    }
}

handler.help = ['vidsave <url>']
handler.tags = ['downloader']
handler.command = /^(vidsave|dl|descargar|global)$/i

export default handler
