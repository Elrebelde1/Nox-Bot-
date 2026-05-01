/**
 * 📂 COMANDO: xnxx
 * 📝 DESCRIPCIÓN: Busca y descarga videos de XNXX con 3 opciones adicionales.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('🚀 Por seguridad, usa este comando en un grupo.')
    
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *¿Qué deseas buscar?*\n\n> *Ejemplo:* ${usedPrefix + command} Rusas`, m)

    if (query.includes('xnxx.com')) {
        await m.react('⏳')
        try {
            const dlRes = await axios.get(`https://api.delirius.store/download/xnxxdl?url=${query}`)
            const dl = dlRes.data.data
            const videoFinal = dl.download.high || dl.download.low
            return await conn.sendMessage(m.chat, { 
                video: { url: videoFinal }, 
                caption: `✅ *Aquí tienes tu video*\n\n> *By: Barboza Developer*`, 
                mimetype: 'video/mp4' 
            }, { quoted: m })
        } catch (e) { return m.reply('⚠️ Error al descargar.') }
    }

    await m.react('🔍')

    try {
        const searchRes = await axios.get(`https://api.delirius.store/search/xnxxsearch?query=${encodeURIComponent(query)}`)
        
        if (!searchRes.data.status || !searchRes.data.data.length) {
            await m.react('❌')
            return m.reply('⚠️ No encontré nada.')
        }

        const res = searchRes.data.data
        const downloadRes = await axios.get(`https://api.delirius.store/download/xnxxdl?url=${res[0].link}`)
        const dl = downloadRes.data.data
        const videoFinal = dl.download.high || dl.download.low

        let info = `🔞 *XNXX CONTENT — BARBOZA*\n\n`
        info += `📌 *Título:* ${dl.title}\n`
        info += `⏱️ *Duración:* ${dl.duration}\n`
        info += `⚙️ *Calidad:* ${dl.quality}\n\n`
        info += `━━━━━━━━━━━━━━━━━━━━\n\n`
        info += `✨ *MÁS OPCIONES:*\n`

        for (let i = 1; i < Math.min(res.length, 4); i++) {
            info += `🎬 *${i}.* ${res[i].title}\n`
            info += `⏱️ *Duran:* ${res[i].duration}\n`
            info += `📥 *Usa:* \`${usedPrefix + command} ${res[i].link}\`\n\n`
        }

        info += `> *By: Barboza Developer x Zona Developers*`

        await conn.sendMessage(m.chat, { 
            video: { url: videoFinal }, 
            caption: info,
            mimetype: 'video/mp4'
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply('⚠️ Error al procesar.')
    }
}

handler.help = ['xnxx']
handler.tags = ['nsfw']
handler.command = /^(xnxx|xnxxdl)$/i

export default handler