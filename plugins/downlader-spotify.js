import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*｢ ⚠ ｣ ESCRIBE EL NOMBRE DE LA CANCIÓN*\n\n*Ejemplo:*\n${usedPrefix + command} Twice - Moonlight Sunrise`, m)

    try { 
        await m.react('🔍')

        // 1. Fase de Búsqueda
        const { data: search } = await axios.get(`https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`)
        
        if (!search.status || !search.data?.[0]) {
            await m.react('✖️')
            return conn.reply(m.chat, `*｢ ✘ ｣ NO SE ENCONTRÓ EL TEMA:* ${text}`, m)
        }

        const target = search.data[0]
        await m.react('⏳')

        // 2. Fase de Descarga Directa
        const { data: dl } = await axios.get(`https://api.delirius.store/download/spotify?url=${target.url}`)

        if (!dl.status || !dl.data) {
            await m.react('✖️')
            return conn.reply(m.chat, `*｢ ✘ ｣ FALLÓ EL SERVIDOR DE DESCARGA.*`, m)
        }

        const { title, author, image, download } = dl.data

        // 3. Respuesta Visual
        const report = `
╭─━━━─「 **SPOTIFY DL** 」─━━━─
┃ 🎧 **TEMA:** ${title}
┃ 👤 **AUTOR:** ${author}
┃ ⏱️ **LAPSO:** ${target.duration || '00:00'}
┃ 📅 **FECHA:** ${target.publish || 'N/A'}
╰─━━━━━━━─━━━━━━━─╯

Creador: Barboza Ofc`.trim()

        await conn.sendMessage(m.chat, { 
            image: { url: image }, 
            caption: report 
        }, { quoted: m })

        // 4. Envío del Audio
        await conn.sendMessage(m.chat, { 
            audio: { url: download }, 
            fileName: `${title}.mp3`, 
            mimetype: 'audio/mpeg',
            ptt: false // Cambia a true si quieres que se envíe como nota de voz
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('✖️')
        console.error(e)
        conn.reply(m.chat, `*｢ ✘ ｣ ERROR CRÍTICO:* Intenta de nuevo más tarde.`, m)
    }
}

handler.help = ['spotify']
handler.tags = ['dl']
handler.command = /^(spotify|spoti|play2)$/i

export default handler
