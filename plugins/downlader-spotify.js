/**
 * 📂 COMANDO: Uchiha Spotify Downloader (Ghost Edition)
 * 📝 DESCRIPCIÓN: Extractor de audio con estética de terminal.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "𝘽𝙮 𝘽𝙖𝙧𝙗𝙤𝙯𝙖"
    const chn = "𝙕𝙤𝙣𝙖 𝘿𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙧𝙨"
    
    if (!text) return conn.reply(m.chat, `── [ 𝚂𝚈𝚂𝚃𝙴𝙼 𝙰𝙻𝙴𝚁𝚃 ] ──\n\n> ⚠️ 𝙵𝚊𝚕𝚝𝚊 𝚍𝚎𝚜𝚝𝚒𝚗𝚘. 𝙸𝚗𝚐𝚛𝚎𝚜𝚊 𝚗𝚘𝚖𝚋𝚛𝚎 𝚘 𝚞𝚛𝚕.\n> 💡 𝙴𝚓: ${usedPrefix + command} Mask Off`, m)

    await m.react('⚡') 

    try {
        let trackUrl = text
        const isUrl = text.match(/^(https?:\/\/)?(open\.spotify\.com|spotify\.link)\/.+$/gi)

        if (!isUrl) {
            const searchRes = await fetch(`https://api.evogb.org/search/spotify?query=${encodeURIComponent(text)}&key=sasuke`)
            const searchData = await searchRes.json()

            if (!searchData.status || !searchData.result.length) {
                await m.react('❌')
                return m.reply('── [ 𝚂𝚈𝚂𝚃𝙴𝙼 𝙴𝚁𝚁𝙾𝚁 ] ──\n\n> ✖️ 𝙽𝚘 𝚜𝚎 𝚑𝚊𝚗 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚊𝚍𝚘 𝚛𝚎𝚜𝚞𝚕𝚝𝚊𝚍𝚘𝚜.')
            }
            trackUrl = searchData.result[0].link
        }

        const dlRes = await fetch(`https://api.evogb.org/dl/spotify?url=${encodeURIComponent(trackUrl)}&key=sasuke`)
        const dlData = await dlRes.json()

        if (!dlData.status) {
            await m.react('❌')
            return m.reply('── [ 𝚂𝚈𝚂𝚃𝙴𝙼 𝙵𝙰𝙸𝙻 ] ──\n\n> ✖️ 𝙴𝚛𝚛𝚘𝚛 𝚎𝚗 𝚕𝚊 𝚍𝚎𝚌𝚘𝚍𝚒𝚏𝚒𝚌𝚊𝚌𝚒𝚘́𝚗 𝚍𝚎𝚕 𝚊𝚞𝚍𝚒𝚘.')
        }

        const info = dlData.data

        let txt = `⚡ 𝚄𝙲𝙷𝙸𝙷𝙰 𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙽𝙴𝚃𝚆𝙾𝚁𝙺 ⚡\n`
        txt += `─────────────────────\n`
        txt += `• 📂 𝙰𝚞𝚍𝚒𝚘: ${info.name}\n`
        txt += `• 👤 𝙰𝚞𝚝𝚘𝚛: ${info.artist}\n`
        txt += `• 💿 𝙰́𝚕𝚋𝚞𝚖: ${info.album}\n`
        txt += `• ⏱️ 𝙻𝚊𝚙𝚜𝚘: ${info.duration}\n`
        txt += `─────────────────────\n`
        txt += `• 📡 𝚂𝚝𝚊𝚝𝚞𝚜: 𝙾𝚗𝚕𝚒𝚗𝚎 ✅\n`
        txt += `• 👤 𝙳𝚎𝚟: ${dev}\n`
        txt += `• 🛠️ 𝙲𝚑𝚗: ${chn}\n`
        txt += `─────────────────────`

        await conn.sendMessage(m.chat, { 
            image: { url: info.imageHD || info.image }, 
            caption: txt 
        }, { quoted: m })

        await conn.sendMessage(m.chat, { 
            audio: { url: info.url }, 
            mimetype: 'audio/mpeg', 
            fileName: `${info.name}.mp3` 
        }, { quoted: m })

        await m.react('🔥') 

    } catch (e) {
        await m.react('❌')
        m.reply(`> ☣️ 𝙴𝚛𝚛𝚘𝚛 𝚒𝚗𝚎𝚜𝚙𝚎𝚛𝚊𝚍𝚘: \`${e.message}\``)
    }
}

handler.help = ['spotify']
handler.tags = ['descargas']
handler.command = ['spotify', 'sp', 'music', 'spt']

export default handler
