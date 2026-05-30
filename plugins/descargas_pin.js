/**
 * 📂 COMANDO: Uchiha Pinterest Search (Multi)
 * 📝 DESCRIPCIÓN: Busca imágenes en Pinterest y envía 5 resultados diferentes.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * Usen los código porfa para traer más 
 * 🔗 API: https://api.evogb.org
 */

import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text || (m.quoted && m.quoted.text ? m.quoted.text : '')

    if (!query) {
        let alert = `✨ PINTEREST BROWSER ✨\n`
        alert += `✧ ────────────────── ✧\n`
        alert += `> *Ingresa lo que deseas buscar en la plataforma.*\n`
        alert += `> *Ejemplo:* ${usedPrefix + command} Neymar`
        return conn.reply(m.chat, alert, m)
    }

    await m.react('🕒')

    try {
        const apiTarget = "https://api.evogb.org/search/pinterest"
        const access = Buffer.from("c2FzdWtl", 'base64').toString('utf-8')
        
        const response = await axios.get(`${apiTarget}?query=${encodeURIComponent(query)}&key=${access}`)
        const result = response.data

        if (!result?.status || !result.data || result.data.length < 5) {
            await m.react('❌')
            return conn.reply(m.chat, '❌ No se encontraron suficientes imágenes para esta búsqueda.', m)
        }

        const imagenes = result.data.slice(0, 5)

        for (let i = 0; i < imagenes.length; i++) {
            const img = imagenes[i]
            
            let txt = `📸 PIN RESTRUCTURADO [${i + 1}/5]\n`
            txt += `✧ ────────────────── ✧\n`
            txt += `  ✩ Topic: ${img.title !== '-' ? img.title : 'Archivo Visual'}\n`
            txt += `  ✩ Author: ${img.full_name || img.username || 'Desconocido'}\n`
            txt += `  ✩ Stats: ${img.likes} Reactions | ${img.followers} Fans\n`
            txt += `✧ ────────────────── ✧\n`
            txt += `⚡ Barboza Developer x Zona Developers`

            await conn.sendMessage(m.chat, { 
                image: { url: img.hd }, 
                caption: txt 
            }, { quoted: m })
        }

        await m.react('🔥')

    } catch (e) {
        await m.react('❌')
    }
}

handler.help = ['pinterest', 'pin']
handler.tags = ['tools']
handler.command = /^(pinterest|pin)$/i

export default handler