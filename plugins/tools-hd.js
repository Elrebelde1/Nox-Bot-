import fetch from "node-fetch"
import { FormData, Blob } from "formdata-node"

const handler = async (m, { conn, text, args }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    await m.react('🕒')

    try {
        const uploadEndpoint = "https://api.evogb.org/tools/upload"
        const upscaleEndpoint = "https://api.evogb.org/tools/upscale"
        const access = "sasuke"

        let tempUrl = ""

        if (/image/.test(mime)) {
            let media = await q.download()
            let form = new FormData()
            let blob = new Blob([media], { type: mime })
            form.append('file', blob, `image.${mime.split('/')[1]}`)

            let res = await fetch(`${uploadEndpoint}?key=${access}`, {
                method: 'POST',
                body: form
            })
            let json = await res.json()
            if (json.status) tempUrl = json.url
        } else if (args[0] && args[0].startsWith('http')) {
            tempUrl = args[0]
        }

        if (!tempUrl) {
            await m.react('❌')
            return conn.reply(m.chat, `⚠️ *SISTEMA UCHIHA*\n\n> 🖼️ *Responde a una imagen o ingresa una URL para mejorar su calidad.*`, m)
        }

        let cleanUrl = tempUrl.split(';')[0].trim()

        let hdResponse = await fetch(`${upscaleEndpoint}?method=url&url=${encodeURIComponent(cleanUrl)}&key=${access}`)
        let hdJson = await hdResponse.json()

        if (!hdJson.status || !hdJson.url) {
            await m.react('❌')
            return conn.reply(m.chat, `❌ El servidor no pudo procesar el escalado HD.`, m)
        }

        let finalHdUrl = hdJson.url.split(';')[0].trim()

        const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
        const net = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"

        let report = `| 🖼️ *𝖴𝖢𝖧𝖨𝖧𝖠 𝖨𝖬𝖠𝖦𝖤  𝖴𝖯𝖲𝖢𝖠𝖫𝖤𝖱* 🖼️\n`
        report += `|═══════════════════\n`
        report += `| 🟢 *𝚂𝚃𝙰𝚃𝚄𝚂:* Calidad Optimizada HD\n`
        report += `| 🔗 *𝚄𝚁𝙻:* ${finalHdUrl}\n`
        report += `|═══════════════════\n`
        report += `| 🛠️ *${dev}*\n`
        report += `| ⛩️ *${net}*`

        await conn.sendMessage(m.chat, { 
            image: { url: finalHdUrl }, 
            caption: report 
        }, { quoted: m })

        await m.react('🔥')

    } catch (e) {
        console.error(e)
        await m.react('❌')
    }
}

handler.help = ['remini', 'hd', 'mejorar', 'upscale']
handler.tags = ['tools']
handler.command = /^(remini|hd|mejorar|upscale)$/i

export default handler
