import fetch from "node-fetch"

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const apiKey = 'sasuke'
    if (!text) return conn.reply(m.chat, `*☁️ Uchiha Cloud Download*\n\n*Uso correcto:*\n> *${usedPrefix + command} Lupita*`, m)

    await m.react('⏳')
    try {
        let resSearch = await fetch(`https://api.evogb.org/search/soundcloud?query=${encodeURIComponent(text)}&key=${apiKey}`)
        let jsonSearch = await resSearch.json()
        if (!jsonSearch.status || !jsonSearch.results || jsonSearch.results.length === 0) {
            await m.react('❌')
            return m.reply('❌ No se encontraron resultados para tu búsqueda.')
        }

        let primerResultado = jsonSearch.results[0]
        let urlDescarga = primerResultado.url

        let resDl = await fetch(`https://api.evogb.org/dl/soundcloud?url=${encodeURIComponent(urlDescarga)}&key=${apiKey}`)
        let jsonDl = await resDl.json()
        if (!jsonDl.success) {
            await m.react('❌')
            return m.reply('❌ Error al procesar la descarga del audio.')
        }

        let { title, artist, banner, dl } = jsonDl.data

        let txt = `*☁️ Uchiha Cloud - Audio Localizado*\n\n`
        txt += `📌 *Título:* ${title}\n`
        txt += `👤 *Artista:* ${artist}\n`
        txt += `⏱️ *Duración:* ${primerResultado.duration || 'Desconocida'}\n\n`
        txt += `📂 *COMANDO:* Uchiha Cloud Download Unified\n`
        txt += `👤 *CREADOR:* Barboza Developer\n`
        txt += `⚡ *CANAL:* Barboza Developer x Zona Developers\n`
        txt += `🔌 *API:* https://api.evogb.org`

        if (banner) {
            await conn.sendMessage(m.chat, { image: { url: banner }, caption: txt }, { quoted: m })
        } else {
            await conn.reply(m.chat, txt, m)
        }

        await conn.sendMessage(m.chat, { 
            audio: { url: dl }, 
            mimetype: 'audio/mpeg', 
            fileName: `${title}.mp3` 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('❌ Ocurrió un error interno en los servidores de Uchiha Cloud.')
    }
}

handler.help = ['sound']
handler.tags = ['downloader']
handler.command = /^(sound|play-sc|scplay)$/i

export default handler
