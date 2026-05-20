import fetch from "node-fetch"
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const botonesCanal = [
        { buttonId: `${usedPrefix}scanal`, buttonText: { displayText: "📢 Ver Canales" }, type: 1 }
    ]

    if (!text.trim()) {
        const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
        let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }
        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚃𝙸𝙺𝚃𝙾𝙺* ♆ 〕─╮\n│\n│ 🎬 *ᴜsᴏ ᴄᴏʀʀᴇᴄᴛᴏ:* \n│ ${usedPrefix + command} [enlace de tiktok]\n│\n│ 🌑 "ᴅᴇsᴄᴀʀɢᴀ ᴛᴜ ᴄᴏɴᴛᴇɴɪᴅᴏ ᴀʟ ɪɴsᴛᴀɴᴛᴇ"\n╰────────────────────────────╯`
        return await conn.sendMessage(m.chat, { 
            image: catalogoImg.byteLength ? catalogoImg : { url: catalogoImg.url }, 
            caption: txt, 
            footer: "By Barboza-Team ⚡", 
            buttons: botonesCanal, 
            headerType: 4 
        }, { quoted: m })
    }

    if (m.react) await m.react('📥')
    const queryTarget = text.trim()

    try {
        let dlUrl = ''
        let descCaption = ''

        let res = await fetch(`https://api.delirius.store/download/tiktok?url=${encodeURIComponent(queryTarget)}`)
        let json = await res.json()
        if (json.status && json.data) {
            dlUrl = json.data.video || json.data.meta?.video?.no_watermark
            descCaption = json.data.title || 'TikTok Video'
        }

        if (!dlUrl) throw 'No se pudo obtener el enlace de descarga directa de la API'

        await conn.sendMessage(m.chat, { video: { url: dlUrl }, caption: `✅ *Resultado:* ${descCaption}`, footer: "By Barboza-Team ⚡" }, { quoted: m })
        if (m.react) await m.react('🔥')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        return conn.reply(m.chat, `🛑 Error al procesar la descarga de TikTok.`, m)
    }
}

handler.command = /^(tiktok)$/i
export default handler
