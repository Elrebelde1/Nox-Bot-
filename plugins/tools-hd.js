import fetch from "node-fetch"
import { FormData, Blob } from "formdata-node"

const handler = async (m, { conn, text, args }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    
    await m.react('🕒')

    try {
        const b = (s) => Buffer.from(s, 'base64').toString('utf-8')
        const endpoint = b("aHR0cHM6Ly9hcGkuZXZvZ2Iub3JnL3Rvb2xzL3VwbG9hZA==")
        const access = b("c2FzdWtl")
        
        let finalUrl = ""

        if (/image|video|audio|document/.test(mime)) {
            let media = await q.download()
            let form = new FormData()
            let blob = new Blob([media], { type: mime })
            form.append('file', blob, `archivo.${mime.split('/')[1]}`)

            let res = await fetch(`${endpoint}?key=${access}`, {
                method: 'POST',
                body: form
            })
            let json = await res.json()
            if (json.status && json.url) finalUrl = json.url
        } else if (args[0] && args[0].startsWith('http')) {
            let res = await fetch(`${endpoint}?url=${encodeURIComponent(args[0])}&key=${access}`)
            let json = await res.json()
            if (json.status && json.url) finalUrl = json.url
        }

        if (!finalUrl) {
            await m.react('❌')
            return conn.reply(m.chat, `⚠️ *SISTEMA UCHIHA*\n\n> 📂 *Responde a una imagen o ingresa una URL válida.*`, m)
        }

        let cleanUrl = finalUrl.split(';')[0].trim()

        const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
        const net = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"

        let report = `| 📂 *𝖴𝖢𝖧𝖨𝖧𝖮 𝖢𝖫𝖮𝖴𝖣 𝖴𝖯𝖫𝖮𝖠𝖣* 📂\n`
        report += `|═══════════════════\n`
        report += `| 🟢 *𝚂𝚃𝙰𝚃𝚄𝚂:* Enlace Generado\n`
        report += `| 🔗 *𝚄𝚁𝙻:* ${cleanUrl}\n`
        report += `|═══════════════════\n`
        report += `| 🛠️ *${dev}*\n`
        report += `| ⛩️ *${net}*`

        await conn.sendMessage(m.chat, { 
            image: { url: cleanUrl }, 
            caption: report 
        }, { quoted: m })
        
        await m.react('✅')

    } catch (e) {
        await m.react('❌')
    }
}

handler.help = ['tourl', 'upload']
handler.tags = ['tools']
handler.command = /^(tourl|upload|subir|hd)$/i

export default handler
