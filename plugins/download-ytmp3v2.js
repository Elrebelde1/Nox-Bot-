/**
 * 📂 COMANDO: Uchiha YouTube Downloader
 * 📝 DESCRIPCIÓN: Extractor de audio de YouTube (MP3).
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * Usen los código porfa para traer más 
 * 🔗 API: https://api.evogb.org/dl/ytmp3?url={link}&key=sasuke
 */

import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const autorCode = "𝑩𝒚 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗"
    const comunidad = "𝒁𝒐𝒏𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓𝒔 ⚡"
    
    if (!text) return conn.reply(m.chat, `🏮 *UCHIHA SYSTEM*\n\n> 🧩 *Pega el link de YouTube*\n> 💡 *Ej:* ${usedPrefix + command} https://youtu.be/...`, m)

    await m.react('🛰️') 

    try {
        const b = (s) => Buffer.from(s, 'base64').toString('utf-8')
        const a = b("aHR0cHM6Ly9hcGkuZXZvZ2Iub3Jn")
        const k = b("c2FzdWtl")

        let res = await fetch(`${a}/dl/ytmp3?url=${encodeURIComponent(text)}&key=${k}`)
        let json = await res.json()

        if (!json.status || !json.data || !json.data.dl) {
            await m.react('❌')
            return m.reply('⚠️ *ERROR CRÍTICO* ⚠️\nNo se pudo extraer el audio de la sombra.')
        }

        const info = json.data

        let txt = `⚔️  *UCHIHA AUDIO PLAYER* ⚔️\n`
        txt += `『 🌑 ═══════════════ 🌑 』\n\n`
        txt += `🎼 *TEMA:* ${info.title}\n`
        txt += `⏳ *TIEMPO:* ${info.duration || 'Desconocido'}\n`
        txt += `💽 *FORMATO:* MP3 (128kbps)\n`
        txt += `🔥 *ESTADO:* Inyectado con éxito\n\n`
        txt += `『 🌑 ═══════════════ 🌑 』\n`
        txt += `💻 ${autorCode}\n`
        txt += `📡 ${comunidad}`

        await conn.sendMessage(m.chat, { 
            image: { url: info.thumbnail }, 
            caption: txt 
        }, { quoted: m })

        await conn.sendMessage(m.chat, { 
            audio: { url: info.dl }, 
            mimetype: 'audio/mpeg', 
            fileName: `${info.title}.mp3` 
        }, { quoted: m })

        await m.react('✅') 

    } catch (e) {
        await m.react('💀')
    }
}

handler.help = ['ytmp3']
handler.tags = ['descargas']
handler.command = ['ytmp3v2', 'yta', 'audio']

export default handler