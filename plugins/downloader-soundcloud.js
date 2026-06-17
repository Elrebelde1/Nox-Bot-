import fetch from "node-fetch"

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const apiKey = 'sasuke'
    if (!text) return conn.reply(m.chat, `*🔍 BÚSQUEDA Y DESCARGA SOUNDCLOUD*\n\n*Ejemplo:* ${usedPrefix + command} Messi`, m)

    if (text.includes('soundcloud.com/')) {
        await m.react('⏳')
        try {
            let res = await fetch(`https://api.evogb.org/dl/soundcloud?url=${encodeURIComponent(text)}&key=${apiKey}`)
            let json = await res.json()
            if (!json.success) return m.reply('❌ Error al procesar la descarga.')

            let { title, artist, banner, dl } = json.data
            let cap = `*☁️ Uchiha Cloud Download*\n\n*Título:* ${title}\n*Artista:* ${artist}\n\n_Procesando audio..._`
            
            await conn.sendMessage(m.chat, { image: { url: banner }, caption: cap }, { quoted: m })
            await conn.sendMessage(m.chat, { audio: { url: dl }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m })
            await m.react('✅')
        } catch (e) {
            m.reply('❌ Error en el servidor de descarga.')
        }
    } else {
        await m.react('🔍')
        try {
            let res = await fetch(`https://api.evogb.org/search/soundcloud?query=${encodeURIComponent(text)}&key=${apiKey}`)
            let json = await res.json()
            if (!json.status) return m.reply('❌ No se encontraron resultados.')

            let results = json.results.slice(0, 5)
            let txt = `*☁️ Uchiha Cloud Search: ${text}*\n\n`
            results.forEach((v, i) => {
                txt += `*${i + 1}.* ${v.title}\n*Artista:* ${v.author.name}\n*Enlace:* ${v.url}\n\n`
            })
            
            txt += `*📂 COMANDO:* Uchiha Cloud Search Unified\n*👤 CREADOR:* Barboza Developer\n*⚡ CANAL:* Barboza Developer x Zona Developers\n*🔌 API:* https://api.evogb.org`
            
            await conn.reply(m.chat, txt, m)
            await m.react('✅')
        } catch (e) {
            m.reply('❌ Error en el servidor de búsqueda.')
        }
    }
}

handler.help = ['soundcloud']
handler.tags = ['downloader']
handler.command = /^(soundcloud|scdl|playsc)$/i

export default handler
