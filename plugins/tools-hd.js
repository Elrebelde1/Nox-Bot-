import fetch from "node-fetch"
import uploadImage from '../lib/uploadImage.js'

const handler = async (m, { conn, text, args }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    let mediaUrl = ""

    if (/image|video|audio|document/.test(mime)) {
        await m.react('🕒')
        let media = await q.download()
        mediaUrl = await uploadImage(media)
    } else if (args[0] && args[0].startsWith('http')) {
        await m.react('🕒')
        mediaUrl = args[0]
    } else {
        return conn.reply(m.chat, `⚠️ *SISTEMA UCHIHA*\n\n> 📂 *Responde a una imagen/archivo o ingresa una URL directamente.*`, m)
    }

    try {
        const b = (s) => Buffer.from(s, 'base64').toString('utf-8')
        const endpoint = b("aHR0cHM6Ly9hcGkuZXZvZ2Iub3JnL3Rvb2xzL3VwbG9hZA==")
        const access = b("c2FzdWtl")

        let res = await fetch(`${endpoint}?url=${encodeURIComponent(mediaUrl)}&key=${access}`)
        let json = await res.json()

        if (!json.status || !json.url) {
            await m.react('❌')
            return m.reply('*Error al subir el archivo al servidor central.*')
        }

        const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
        const net = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"

        let report = `| 📂 *𝖴𝖢𝖧𝖨𝖧A CLOUD UPLOAD* 📂\n`
        report += `|═══════════════════\n`
        report += `| 🟢 *𝚂𝚃𝙰𝚃𝚄𝚂:* Enlace Generado\n`
        report += `| 🔗 *𝚄𝚁𝙻:* ${json.url}\n`
        report += `|═══════════════════\n`
        report += `| 🛠️ *${dev}*\n`
        report += `| ⛩️ *${net}*`

        await conn.reply(m.chat, report, m)
        await m.react('✅')

    } catch (e) {
        await m.react('❌')
    }
}

handler.help = ['tourl', 'upload']
handler.tags = ['tools']
handler.command = /^(hd|upload|subir)$/i

export default handler
