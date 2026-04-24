import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Validación con estilo Sasuke MD
    if (!text) return m.reply(`*〈 ⛩️ 𝚂𝙰𝚂𝚄𝙺𝙴 𝙱𝙾𝚃 𝙼𝙳 ⛩️ 〉*\n\n> 🌙 *𝚄𝚂𝙾:* ${usedPrefix + command} <nombre/url>\n> 💡 _Ejemplo: ${usedPrefix + command} Moonlight Sunrise_`)

    await m.react('⚡') 

    try {
        const isUrl = text.match(/^(https?:\/\/)?(open\.spotify\.com|spotify\.link)\/.+$/gi)
        let track

        if (isUrl) {
            track = { url: text, title: 'Spotify Track' }
        } else {
            const searchRes = await fetch(`https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`)
            const searchData = await searchRes.json()

            if (!searchData.status || !searchData.data.length) {
                await m.react('✖️')
                return m.reply('`『 👁️‍🗨️ ERROR: OBJETIVO NO ENCONTRADO 』`')
            }

            track = searchData.data[0]

            // Diseño de información (Uchiha Style)
            let txt = `*｢ 🎧 𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙼𝚄𝚂𝙸𝙲 ｣*\n`
            txt += `───── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ─────\n`
            txt += `> 👤 *𝙰𝚁𝚃𝙸𝚂𝚃𝙰:* ${track.artist}\n`
            txt += `> 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${track.title}\n`
            txt += `> 💿 *𝙰𝙻𝙱𝚄𝙼:* ${track.album || 'N/A'}\n`
            txt += `> ⏱️ *𝙳𝚄𝚁𝙰𝙲𝙸𝙾𝙽:* ${track.duration}\n`
            txt += `> 📅 *𝙿𝚄𝙱𝙻𝙸𝙲𝙰𝙳𝙾:* ${track.publish}\n`
            txt += `───── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ─────\n\n`
            txt += `*『 🐦‍⬛ 𝙸𝙽𝚅𝙾𝙲𝙰𝙽𝙳𝙾 𝙰𝚄𝙳𝙸𝙾... 』*`

            await conn.sendMessage(m.chat, { 
                image: { url: track.image }, 
                caption: txt 
            }, { quoted: m })
        }

        const downloadRes = await fetch(`https://api.delirius.store/download/spotifydl?url=${track.url}`)
        const downloadData = await downloadRes.json()

        if (downloadData.status && downloadData.data.download) {
            await conn.sendMessage(m.chat, { 
                audio: { url: downloadData.data.download }, 
                mimetype: 'audio/mpeg', 
                fileName: `${track.title}.mp3` 
            }, { quoted: m })
            await m.react('🔥') 
        } else {
            await m.react('✖️')
            m.reply('`『 👁️‍🗨️ FALLO EN LA EXTRACCIÓN 』`')
        }

    } catch (e) {
        await m.react('✖️')
        console.error(e)
        m.reply(`*❌ ERROR CRÍTICO:* \`${e.message}\``)
    }
}

handler.help = ['spotify']
handler.tags = ['descargas']
handler.command = ['spotify', 'sp', 'music', 'spt']

export default handler
