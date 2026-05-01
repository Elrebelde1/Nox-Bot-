/**
 * 📂 COMANDO: xnxx
 * 📝 DESCRIPCIÓN: Buscador de XNXX con enlaces directos para descarga fácil.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.isGroup) return
    
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *¿Qué buscas?*\n\n> *Ejemplo:* ${usedPrefix + command} Rusas`, m)

    // Si el usuario envía un link de XNXX, lo descarga directo
    if (query.includes('xnxx.com')) {
        await m.react('⏳')
        try {
            const dlRes = await axios.get(`https://api.delirius.store/download/xnxxdl?url=${query}`)
            const dl = dlRes.data.data
            const videoFinal = dl.download.high || dl.download.low
            return await conn.sendMessage(m.chat, { 
                video: { url: videoFinal }, 
                caption: `✅ *Aquí tienes el video*\n\n> *By: Barboza Developer*`, 
                mimetype: 'video/mp4' 
            }, { quoted: m })
        } catch (e) { return m.reply('⚠️ Error al descargar.') }
    }

    await m.react('🔍')

    try {
        const { data: searchRes } = await axios.get(`https://api.delirius.store/search/xnxxsearch?query=${encodeURIComponent(query)}`)
        
        if (!searchRes.status || !searchRes.data.length) {
            await m.react('❌')
            return
        }

        const res = searchRes.data
        const downloadRes = await axios.get(`https://api.delirius.store/download/xnxxdl?url=${res[0].link}`)
        const dl = downloadRes.data.data
        const videoFinal = dl.download.high || dl.download.low

        let info = `🔞 *C0NT3NID0 — B4RB0Z4*\n\n`
        info += `📌 *Título:* ${dl.title}\n`
        info += `⏱️ *Dura:* ${dl.duration}\n\n`
        info += `━━━━━━━━━━━━━━━━━━━━\n\n`
        info += `✨ *0TR4S 0PCI0N3S:*\n`

        for (let i = 1; i < Math.min(res.length, 4); i++) {
            // Se muestra el comando para que al tocarlo se copie/envíe fácilmente
            info += `🎬 *${i}.* ${res[i].title}\n`
            info += `📥 *Toca para bajar:* ${usedPrefix + command} ${res[i].link}\n\n`
        }

        info += `> *By: Barboza Developer*`

        await conn.sendMessage(m.chat, { 
            video: { url: videoFinal }, 
            caption: info,
            mimetype: 'video/mp4',
            fileName: 'media_file.mp4' 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
    }
}

handler.help = ['xnxx']
handler.tags = ['nsfw']
handler.command = /^(xnxx|xnxxdl)$/i

export default handler
