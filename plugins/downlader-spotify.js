/**
 * 📂 COMANDO: Uchiha Spotify Downloader
 * 📝 DESCRIPCIÓN: Extractor de audio de Spotify (Búsqueda + Descarga).
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * Usen los código porfa para traer más 
 * 🔗 API: https://api.evogb.org/dl/spotify
 */

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "𝘽𝙮 𝘽𝙖𝙧𝙗𝙤𝙯𝙖"
    const chn = "𝙕𝙤𝙣𝙖 𝘿𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙧𝙨"
    
    if (!text) return conn.reply(m.chat, `『 ⚡ 𝚄𝙲𝙷𝙸𝙷𝙰 𝚂𝚈𝚂𝚃𝙴𝙼 ⚡ 』\n\n> 🧩 *𝙸𝚗𝚐𝚛𝚎𝚜𝚎 𝚗𝚘𝚖𝚋𝚛𝚎 𝚘 𝚕𝚒𝚗𝚔.*\n> 💡 *𝙴𝚓:* ${usedPrefix + command} Mask Off`, m)

    await m.react('⚡') 

    try {
        const b = (s) => Buffer.from(s, 'base64').toString('utf-8')
        const a = b("aHR0cHM6Ly9hcGkuZXZvZ2Iub3Jn")
        const k = b("c2FzdWtl")

        let trackUrl = text
        const isUrl = text.match(/^(https?:\/\/)?(open\.spotify\.com|spotify\.link)\/.+$/gi)

        if (!isUrl) {
            const sRes = await fetch(`${a}/search/spotify?query=${encodeURIComponent(text)}&key=${k}`)
            const sData = await sRes.json()
            if (!sData.status || !sData.result.length) {
                await m.react('❌')
                return m.reply('*🏮 [ ERROR ]* No encontrado.')
            }
            trackUrl = sData.result[0].link
        }

        const dlRes = await fetch(`${a}/dl/spotify?url=${encodeURIComponent(trackUrl)}&key=${k}`)
        const dlData = await dlRes.json()

        if (!dlData.status) {
            await m.react('❌')
            return m.reply('*🏮 [ FALLO ]* Error al extraer audio.')
        }

        const info = dlData.data

        let txt = `┏━━━━━━━━━━━━━━━━━━┓\n`
        txt += `┃   🏮  *UCHIHA SPOTIFY* 🏮\n`
        txt += `┣━━━━━━━━━━━━━━━━━━┛\n`
        txt += `┃\n`
        txt += `┃ 🎵 *Tɪ́ᴛᴜʟᴏ:* ${info.name}\n`
        txt += `┃ 👤 *Aʀᴛɪsᴛᴀ:* ${info.artist}\n`
        txt += `┃ 💿 *Áʟʙᴜᴍ:* ${info.album}\n`
        txt += `┃ ⏱️ *Tɪᴇᴍᴘᴏ:* ${info.duration}\n`
        txt += `┃\n`
        txt += `┃ ⚙️ *Esᴛᴀᴅᴏ:* 🟢 Inyectado\n`
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

        await m.react('🔥') 

    } catch (e) {
        await m.react('❌')
    }
}

handler.help = ['spotify']
handler.tags = ['descargas']
handler.command = ['spotify', 'sp', 'music', 'spt']

export default handler
