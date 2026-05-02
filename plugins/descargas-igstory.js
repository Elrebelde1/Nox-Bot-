/**
 * 📂 COMANDO: tiktok2
 * 📝 DESCRIPCIÓN: Descarga avanzada de TikTok con UI Premium y apikey oculta.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import axios from 'axios'

async function tiktokScraper(url) {
    try {
        const key64 = 'c2FzdWtl' 
        const decodedKey = Buffer.from(key64, 'base64').toString('utf-8')
        
        const { data } = await axios.get(`https://api.evogb.org/dl/tiktok?url=${encodeURIComponent(url)}&key=${decodedKey}`)
        
        if (!data.status) return { status: false }
        return {
            status: true,
            title: data.data.title,
            author: data.data.author.nickname,
            user: data.data.author.unique_id,
            duration: data.data.duration,
            likes: data.data.stats.likes,
            shares: data.data.stats.shares,
            download: data.data.dl
        }
    } catch (e) {
        return { status: false }
    }
}

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *¿Qué video deseas bajar?*\n\n> *Ejemplo:* ${usedPrefix + command} https://vt.tiktok.com/...`, m)

    await m.react('⚡')

    const res = await tiktokScraper(query)

    if (!res.status) {
        await m.react('❌')
        return m.reply('⚠️ *Error al procesar el enlace.*')
    }

    let ui = `┏━━━━━━━━━━━━━━━━┓\n`
    ui += `┃  ⭐ *TIKTOK DOWNLOAD* ┃\n`
    ui += `┗━━━━━━━━━━━━━━━━┛\n\n`
    ui += `📝 *TÍTULO:* ${res.title.slice(0, 100)}...\n`
    ui += `👤 *AUTOR:* ${res.author} (@${res.user})\n`
    ui += `⏱️ *DURACIÓN:* ${res.duration}\n`
    ui += `📊 *STATS:* ❤️ ${res.likes.toLocaleString()} | 🔄 ${res.shares.toLocaleString()}\n\n`
    ui += `⚡ *Powered by Barboza Developer*\n`
    ui += `🌐 *Zona Developers*`

    await conn.sendMessage(m.chat, { 
        video: { url: res.download }, 
        caption: ui,
        mimetype: 'video/mp4',
        fileName: `tiktok_v2_barboza.mp4`
    }, { quoted: m })

    await m.react('✅')
}

handler.help = ['tiktok2']
handler.tags = ['downloader']
handler.command = /^(tiktok2|tt2)$/i

export default handler
