import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    // Validation
    if (!text) return m.reply(`*〈 ⛩️ 𝚂𝙰𝚂𝚄𝙺𝙴 𝙱𝙾𝚃 𝙼𝙳 ⛩️ 〉*\n\n> 🌙 *𝚄𝚂𝙾:* ${usedPrefix + command} <nombre de canción>\n> 💡 _Ejemplo: ${usedPrefix + command} Lupita_`)

    await m.react('⚡') 

    try {
        // 1. Search for the track using the evogb API provided in your snippet
        const searchUrl = `https://api.evogb.org/search/spotify?query=${encodeURIComponent(text)}&key=sasuke`
        const searchRes = await fetch(searchUrl)
        const searchData = await searchRes.json()

        if (!searchData.status || !searchData.result.length) {
            await m.react('✖️')
            return m.reply('`『 👁️‍🗨️ ERROR: OBJETIVO NO ENCONTRADO 』`')
        }

        // Get the first result
        const track = searchData.result[0]

        // 2. Information Display (Uchiha Style)
        let txt = `*｢ 🎧 𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙼𝚄𝚂𝙸𝙲 ｣*\n`
        txt += `───── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ─────\n`
        txt += `> 👤 *𝙰𝚁𝚃𝙸𝚂𝚃𝙰:* ${track.artist}\n`
        txt += `> 🎵 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${track.title}\n`
        txt += `> 🆔 *ID:* ${track.id}\n`
        txt += `───── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ─────\n\n`
        txt += `*『 🐦‍⬛ 𝙸𝙽𝚅𝙾𝙲𝙰𝙽𝙳𝙾 𝙰𝚄𝙳𝙸𝙾... 』*`

        await conn.sendMessage(m.chat, { 
            image: { url: track.image }, 
            caption: txt 
        }, { quoted: m })

        // 3. Download the track
        // Note: Using the download endpoint. Ensure the downloader matches your API provider.
        const downloadRes = await fetch(`https://api.delirius.store/download/spotifydl?url=${track.link}`)
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
            m.reply('`『 👁️‍🗨️ FALLO EN LA EXTRACCIÓN DEL CHAKRA (AUDIO) 』`')
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
