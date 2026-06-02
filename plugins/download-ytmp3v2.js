/**
 * 📂 COMANDO: Uchiha YouTube MP3 Downloader
 * 📝 DESCRIPCIÓN: Extrae y descarga el audio de YouTube con el mapeo del JSON de la API.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let enlace = text || (m.quoted && m.quoted.text ? m.quoted.text : '')

    if (!enlace || !/youtube\.com|youtu\.be/i.test(enlace)) {
        let menuFallo = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`
        menuFallo += `┃ 📥 *UCHIHA AUDIO MULTIMEDIA* 📥\n`
        menuFallo += `┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃\n`
        menuFallo += `┃ ⚠️ *ESTADO:* Enlace ausente o inválido.\n`
        menuFallo += `┃ 📌 *ACCIÓN:* Proporcione un link de YouTube.\n`
        menuFallo += `┃\n`
        menuFallo += `┃ 💡 *EJEMPLO:* \n`
        menuFallo += `┃ > ${usedPrefix + command} https://youtu.be/NjxFV1WKPiIn`
        menuFallo += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
        return conn.reply(m.chat, menuFallo, m)
    }

    await m.react('🎧')

    try {
        const apiAudio = "https://api.evogb.org/dl/ytmp3"
        const tokenB64 = Buffer.from("c2FzdWtl", 'base64').toString('utf-8')
        const endpointFinal = `${apiAudio}?url=${encodeURIComponent(enlace)}&key=${tokenB64}`

        let conexion = await fetch(endpointFinal)
        let objetoJson = await conexion.json()

        if (objetoJson && objetoJson.status === true && objetoJson.data && objetoJson.data.dl) {
            const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
            const net = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"
            
            const streamUrl = objetoJson.data.dl
            const nombreVideo = objetoJson.data.title || 'Uchiha Audio Track'
            const pesoArchivo = objetoJson.data.size || 'Desconocido'

            let infoExtensa = `🔮 ━━━ 【 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖣𝖤 𝖠𝖴𝖣𝖨𝖮 𝖧𝖨𝖣𝖣𝖤𝖭 𝖫𝖤𝖠𝖥 】 ━━━ 🔮\n\n`
            infoExtensa += `⬡ *𝖳𝖨𝖳𝖴𝖫𝖮:* ${nombreVideo}\n`
            infoExtensa += `⬡ *𝖯𝖤𝖲𝖮:* ${pesoArchivo}\n`
            infoExtensa += `⬡ *𝖥𝖮𝖱𝖬𝖠𝖳𝖮:* MP3 (MPEG Audio)\n\n`
            infoExtensa += `📊 ─── 【 𝖤𝖲𝖳𝖠𝖣𝖨𝖲𝖳𝖨𝖢𝖠𝖲 𝖣𝖤𝖫 𝖲𝖤𝖱𝖵𝖨𝖣𝖮𝖱 】 ───\n`
            infoExtensa += `⬡ *𝖢𝖠𝖫𝖨𝖣𝖠𝖣:* 128kbps Optimizada\n`
            infoExtensa += `⬡ *𝖭𝖮𝖣𝖮:* Enlace de descarga directo generado con éxito\n\n`
            infoExtensa += `🤝 ─── 【 𝖢𝖱𝖤𝖣𝖨𝖳𝖮𝖲 】 ───\n`
            infoExtensa += `⬡ *𝖢𝖱𝖤𝖠𝖣𝖮𝖱:* ${dev}\n`
            infoExtensa += `⬡ *𝖲𝖮𝖯𝖮𝖱𝖳𝖤:* ${net}\n`
            infoExtensa += `👁️‍🗨️━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━👁️‍🗨️`

            await conn.sendMessage(m.chat, { 
                audio: { url: streamUrl }, 
                mimetype: 'audio/mpeg',
                caption: infoExtensa
            }, { quoted: m })
            
            await m.react('🔥')
        } else {
            await m.react('❌')
            return conn.reply(m.chat, `❌ El servidor central de audio no procesó la solicitud correctamente.`, m)
        }

    } catch (err) {
        console.error(err)
        await m.react('❌')
    }
}

handler.help = ['ytmp3']
handler.tags = ['downloader']
handler.command = /^(ytmp3|yta)$/i

export default handler
