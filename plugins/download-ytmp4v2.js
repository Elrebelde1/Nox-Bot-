/**
 * 📂 COMANDO: Uchiha YouTube MP4 Downloader
 * 📝 DESCRIPCIÓN: Extrae y descarga el video de YouTube con el mapeo del JSON de la API.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let linkVideo = text || (m.quoted && m.quoted.text ? m.quoted.text : '')

    if (!linkVideo || !/youtube\.com|youtu\.be/i.test(linkVideo)) {
        let menuAdvertencia = `╭🎲 ════════════════════════ 🎲╮\n`
        menuAdvertencia += `│ 🎥 *UCHIHA VIDEO STREAM* 🎥\n`
        menuAdvertencia += `│ ──────────────────────────\n`
        menuAdvertencia += `│ 🔴 *ERROR:* No se detectó url válida.\n`
        menuAdvertencia += `│ 📌 *REQUISITO:* Inserte un link de YouTube.\n`
        menuAdvertencia += `│\n`
        menuAdvertencia += `│ 💡 *FORMATO:* \n`
        menuAdvertencia += `│ > ${usedPrefix + command} https://youtu.be/NjxFV1WKPiIn`
        menuAdvertencia += `╰🎲 ════════════════════════ 🎲╯`
        return conn.reply(m.chat, menuAdvertencia, m)
    }

    await m.react('🎬')

    try {
        const apiVideo = "https://api.evogb.org/dl/ytmp4"
        const claveB64 = Buffer.from("c2FzdWtl", 'base64').toString('utf-8')
        const rutaPeticion = `${apiVideo}?url=${encodeURIComponent(linkVideo)}&quality=720&key=${claveB64}`

        let respuestaServidor = await fetch(rutaPeticion)
        let datosJson = await respuestaServidor.json()

        if (datosJson && datosJson.status === true && datosJson.data && datosJson.data.dl) {
            const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
            const net = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"
            
            const videoUrl = datosJson.data.dl
            const encabezadoVideo = datosJson.data.title || 'Uchiha Visual Track'
            const resolucionReal = datosJson.data.quality || '720p'

            let reporteDetallado = `🎬 ━━━ 【 𝖢𝖮𝖭𝖳𝖤𝖭𝖨𝖣𝖮 𝖵𝖨𝖲𝖴𝖠𝖫 𝖴𝖢𝖧𝖨𝖧𝖠 】 ━━━ 🎬\n\n`
            reporteDetallado += `◈ *𝖭𝖮𝖬𝖡𝖱𝖤:* ${encabezadoVideo}\n`
            reporteDetallado += `◈ *𝖱𝖤𝖲𝖮𝖫𝖴𝖢𝖨𝖮𝖭:* ${resolucionReal}\n`
            reporteDetallado += `◈ *𝖤𝖷𝖳𝖤𝖭𝖲𝖨𝖮𝖭:* MP4 Video H264\n\n`
            reporteDetallado += `📈 ─── 【 𝖬𝖤𝖳𝖱𝖨𝖢𝖠𝖲 𝖣𝖤 𝖯𝖱𝖮𝖢𝖤𝖲𝖠𝖬𝖨𝖤𝖭𝖳𝖮 】 ───\n`
            reporteDetallado += `◈ *𝖤𝖲𝖳𝖠𝖣𝖮:* Descarga en memoria directa e inyección de búfer\n`
            reporteDetallado += `◈ *𝖭𝖮𝖣𝖮 𝖢𝖫𝖮𝖴𝖣:* Servidor Activo sin restricciones de Hotlinking\n\n`
            reporteDetallado += `🤝 ─── 【 𝖢𝖱𝖤𝖣𝖨𝖳𝖮𝖲 】 ───\n`
            reporteDetallado += `◈ *𝖣𝖤𝖲𝖠𝖱𝖱𝖮𝖫𝖫𝖠𝖣𝖮𝖱:* ${dev}\n`
            reporteDetallado += `◈ *𝖨𝖭𝖥𝖱𝖠𝖤𝖲𝖳𝖱𝖴𝖢𝖳𝖴𝖱𝖠:* ${net}\n`
            reporteDetallado += `💥━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━💥`

            await conn.sendMessage(m.chat, { 
                video: { url: videoUrl }, 
                caption: reporteDetallado,
                mimetype: 'video/mp4'
            }, { quoted: m })
            
            await m.react('🔥')
        } else {
            await m.react('❌')
            return conn.reply(m.chat, `❌ El servidor central de video no pudo retornar el archivo multimedia de forma limpia.`, m)
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
    }
}

handler.help = ['ytmp4']
handler.tags = ['downloader']
handler.command = /^(ytmp4v2|ytv)$/i

export default handler
