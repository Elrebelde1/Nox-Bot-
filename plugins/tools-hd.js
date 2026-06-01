import axios from 'axios'

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
            
            // Reemplazo completo de FormData usando un constructor nativo en la petición de Axios
            const blobData = new Blob([media], { type: mime })
            const form = new FormData()
            form.append('file', blobData, `image.${mime.split('/')[1]}`)

            let res = await axios.post(`${uploadEndpoint}?key=${access}`, form, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            
            if (res.data && res.data.status === true && res.data.url) {
                tempUrl = res.data.url
            }
        } else if (args[0] && args[0].startsWith('http')) {
            tempUrl = args[0]
        }

        if (!tempUrl) {
            await m.react('❌')
            return conn.reply(m.chat, `⚠️ *SISTEMA UCHIHA*\n\n> 🖼️ *Responde a una imagen o ingresa una URL para mejorar su calidad.*`, m)
        }

        let cleanUrl = tempUrl.split(';')[0].trim()

        // Petición GET limpia usando Axios pasándole los parámetros exactos del JSON
        let hdResponse = await axios.get(`${upscaleEndpoint}`, {
            params: {
                method: 'url',
                url: cleanUrl,
                key: access
            }
        })

        if (hdResponse.data && hdResponse.data.status === true && hdResponse.data.url) {
            let finalHdUrl = hdResponse.data.url.split(';')[0].trim()

            // Descarga directa del búfer final mediante Axios (arraybuffer) para evitar bloqueos de renderizado
            let imageStream = await axios.get(finalHdUrl, { responseType: 'arraybuffer' })
            let imageBuffer = Buffer.from(imageStream.data, 'binary')

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
                image: imageBuffer, 
                caption: report 
            }, { quoted: m })

            await m.react('🔥')
        } else {
            await m.react('❌')
            return conn.reply(m.chat, `❌ El servidor no devolvió una respuesta válida de escalado.`, m)
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
    }
}

handler.help = ['remini', 'hd', 'mejorar', 'upscale']
handler.tags = ['tools']
handler.command = /^(remini|hd|mejorar|upscale)$/i

export default handler
