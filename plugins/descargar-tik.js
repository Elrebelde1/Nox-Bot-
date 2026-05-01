/**
 * 📂 COMANDO: xnxx
 * 📝 DESCRIPCIÓN: Busca, descarga y muestra resultados de XNXX.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.isGroup) return m.reply('🚀 Por seguridad, usa este comando en un grupo.')
    
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *¿Qué deseas buscar?*\n\n> *Ejemplo:* ${usedPrefix + command} Rusas`, m)

    // Si el usuario envía un link directamente
    if (query.includes('xnxx.com')) {
        await m.react('⏳')
        try {
            const dlRes = await axios.get(`https://api.delirius.store/download/xnxxdl?url=${query}`)
            const dl = dlRes.data.data
            const videoFinal = dl.download.high || dl.download.low
            return await conn.sendMessage(m.chat, { video: { url: videoFinal }, caption: `✅ *Aquí tienes tu video*\n\n> *By: Barboza Developer*`, mimetype: 'video/mp4' }, { quoted: m })
        } catch (e) { return m.reply('⚠️ Error al descargar el link.') }
    }

    await m.react('🔍')

    try {
        const searchRes = await axios.get(`https://api.delirius.store/search/xnxxsearch?query=${encodeURIComponent(query)}`)
        
        if (!searchRes.data.status || !searchRes.data.data.length) {
            await m.react('❌')
            return m.reply('⚠️ No se encontraron resultados.')
        }

        const resultados = searchRes.data.data
        const primero = resultados[0]
        
        // Obtenemos descarga del primero
        const downloadRes = await axios.get(`https://api.delirius.store/download/xnxxdl?url=${primero.link}`)
        const dl = downloadRes.data.data
        const videoFinal = dl.download.high || dl.download.low

        // Construimos la lista de sugerencias
        let listado = `🔞 *XNXX CONTENT — BARBOZA*\n\n`
        listado += `📌 *Título:* ${dl.title}\n`
        listado += `⏱️ *Duración:* ${dl.duration}\n`
        listado += `⚙️ *Calidad:* ${dl.quality}\n\n`
        listado += `━━━━━━━━━━━━━━━━━━━━\n\n`
        listado += `✨ *MÁS RESULTADOS:*\n`

        // Listamos los siguientes 5 resultados
        for (let i = 1; i < Math.min(resultados.length, 6); i++) {
            listado += `🎬 *${i}.* ${resultados[i].title}\n`
            listado += `📥 *Descargar:* \`${usedPrefix + command} ${resultados[i].link}\`\n\n`
        }

        listado += `> *By: Barboza Developer x Zona Developers*`

        await conn.sendMessage(m.chat, { 
            video: { url: videoFinal }, 
            caption: listado,
            mimetype: 'video/mp4',
            fileName: `video_barboza.mp4`
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply('⚠️ Error al procesar la solicitud.')
    }
}

handler.help = ['xnxx']
handler.tags = ['nsfw']
handler.command = /^(xnxx|xnxxdl)$/i

export default handler
