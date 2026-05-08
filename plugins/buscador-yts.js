/**
 * 📂 COMANDO: YouTube Search
 * 📝 DESCRIPCIÓN: Búsqueda de videos en YouTube.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *Ingresa lo que deseas buscar*\n\n> *Ejemplo:* ${usedPrefix + command} Lupita`, m)

    await m.react('🔍')

    try {
        const _0x4a1b = 'ZWt1c2Fz' 
        const key = Buffer.from(_0x4a1b, 'base64').toString('utf-8').split('').reverse().join('')

        const { data } = await axios.get(`https://api.evogb.org/search/yt?query=${encodeURIComponent(query)}&key=${key}`)

        if (!data.status || !data.result.length) {
            await m.react('❌')
            return m.reply('⚠️ *No se encontraron resultados.*')
        }

        let ui = `┏━━━━━━━━━━━━━━━━┓\n`
        ui += `┃   🎥 *YOUTUBE SEARCH* ┃\n`
        ui += `┗━━━━━━━━━━━━━━━━┛\n\n`

        data.result.slice(0, 6).forEach((vid, i) => {
            ui += `*${i + 1}.* ${vid.title}\n`
            ui += `👤 *Autor:* ${vid.autor}\n`
            ui += `⏱️ *Duración:* ${vid.duration}\n`
            ui += `👁️ *Vistas:* ${vid.views}\n`
            ui += `🔗 *Link:* ${vid.url}\n\n`
        })

        ui += `━━━━━━━━━━━━━━━━━━━━\n`
        ui += `⚡ *By: Barboza Developer*\n`
        ui += `🌐 *Zona Developers*`

        await conn.sendMessage(m.chat, { 
            image: { url: data.result[0].banner }, 
            caption: ui 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply('⚠️ *Error al conectar con la API de YouTube.*')
    }
}

handler.help = ['yts', 'youtube']
handler.tags = ['search']
handler.command = /^(yts|ytsearch|youtube|yt)$/i

export default handler