/**
 * 📂 COMANDO: yts / ytsearch
 * 📝 DESCRIPCIÓN: Buscador de YouTube usando Scraper nativo (0 APIs).
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

// Asegúrate de tener instalada esta dependencia en tu bot: npm i yt-search
import ytSearch from 'yt-search'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let query = text ? text.trim() : (m.quoted?.text || null)
    if (!query) return conn.reply(m.chat, `✨ *Ingresa lo que deseas buscar*\n\n> *Ejemplo:* ${usedPrefix + command} Lupita`, m)

    await m.react('🔍')

    try {
        // Ejecuta el scraper directo a YouTube
        const searchRes = await ytSearch(query)
        const videos = searchRes.videos

        // Si no encuentra videos, tira el error para pasar al catch
        if (!videos || videos.length === 0) {
            await m.react('❌')
            return m.reply('⚠️ *No se encontraron resultados.*')
        }

        let ui = `┏━━━━━━━━━━━━━━━━┓\n`
        ui += `┃   🎥 *YOUTUBE SEARCH* ┃\n`
        ui += `┗━━━━━━━━━━━━━━━━┛\n\n`

        // Tomamos los primeros 6 resultados del scraper
        videos.slice(0, 6).forEach((vid, i) => {
            ui += `*${i + 1}.* ${vid.title}\n`
            ui += `👤 *Autor:* ${vid.author.name}\n`
            ui += `⏱️ *Duración:* ${vid.timestamp}\n`
            ui += `👁️ *Vistas:* ${vid.views.toLocaleString()}\n`
            ui += `🔗 *Link:* ${vid.url}\n\n`
        })

        ui += `━━━━━━━━━━━━━━━━━━━━\n`
        ui += `⚡ *By: Barboza Developer*\n`
        ui += `🌐 *Zona Developers*`

        // Envía la imagen del primer video junto con la lista recopilada por el scraper
        await conn.sendMessage(m.chat, { 
            image: { url: videos[0].thumbnail }, 
            caption: ui 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('⚠️ *Error interno al ejecutar el scraper de YouTube.*')
    }
}

handler.help = ['yts', 'youtube']
handler.tags = ['search']
handler.command = /^(yts|ytsearch|youtube|yt)$/i

export default handler
