/**
 * 📂 COMANDO: Spotify Music Download
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔗 API: https://api.evogb.org/
 */

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "𝘽𝙮 𝘽𝙖𝙧𝙗𝙤𝙯𝙖"
    const chn = "𝙕𝙤𝙣𝙖 𝘿𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙧𝙨"
    
    const _0x1a2b = ["\x73\x61\x73\x75\x6b\x65"] 
    const key = _0x1a2b[0]

    if (!text) return m.reply(`*🏮 [ SISTEMA UCHIHA ]*\n\n> 🌙 *𝚄𝚂𝙾:* ${usedPrefix + command} <nombre/url>\n> 💡 _Ejemplo: ${usedPrefix + command} Hay Lupita_`)

    if (m.react) await m.react('⚡') 

    try {
        let trackUrl = text
        const isUrl = text.match(/^(https?:\/\/)?(open\.spotify\.com|spotify\.link)\/.+$/gi)

        if (!isUrl) {
            const searchRes = await fetch(`https://api.evogb.org/search/spotify?query=${encodeURIComponent(text)}&key=${key}`)
            const searchData = await searchRes.json()

            if (!searchData.status || !searchData.result.length) {
                if (m.react) await m.react('❌')
                return m.reply('`『 👁️‍🗨️ ERROR: OBJETIVO NO ENCONTRADO 』`')
            }
            trackUrl = searchData.result[0].link
        }

        const dlRes = await fetch(`https://api.evogb.org/dl/spotify?url=${encodeURIComponent(trackUrl)}&key=${key}`)
        const dlData = await dlRes.json()

        if (!dlData.status) {
            if (m.react) await m.react('❌')
            return m.reply('`『 👁️‍🗨️ FALLO EN EL CHAKRA DE DESCARGA 』`')
        }

        const info = dlData.data

        let txt = `┏━━━━━━━━━━━━━━━━━━┓\n`
        txt += `┃   🏮  *SPOTIFY UCHIHA* 🏮\n`
        txt += `┣━━━━━━━━━━━━━━━━━━┛\n`
        txt += `┃\n`
        txt += `┃ 👤 *Aʀᴛɪsᴛᴀ:* ${info.artist}\n`
        txt += `┃ 🎵 *Tɪ́tᴜʟᴏ:* ${info.name}\n`
        txt += `┃ 💿 *Áʟʙᴜᴍ:* ${info.album}\n`
        txt += `┃ ⏱️ *Dᴜʀᴀᴄɪᴏ́ɴ:* ${info.duration}\n`
        txt += `┃\n`
        txt += `┣━━━━━━━━━━━━━━━━━━┓\n`
        txt += `┃ ⚡ *${dev}*\n`
        txt += `┃ 📡 *${chn}*\n`
        txt += `┗━━━━━━━━━━━━━━━━━━┛`

        await conn.sendMessage(m.chat, { 
            image: { url: info.imageHD || info.image }, 
            caption: txt 
        }, { quoted: m })

        await conn.sendMessage(m.chat, { 
            audio: { url: info.url }, 
            mimetype: 'audio/mpeg', 
            fileName: `${info.name}.mp3` 
        }, { quoted: m })

        if (m.react) await m.react('🔥') 

    } catch (e) {
        if (m.react) await m.react('❌')
        m.reply(`*❌ ERROR CRÍTICO:* \`${e.message}\``)
    }
}

handler.help = ['spotify']
handler.tags = ['descargas']
handler.command = ['spotify', 'sp', 'music', 'spt']

export default handler
