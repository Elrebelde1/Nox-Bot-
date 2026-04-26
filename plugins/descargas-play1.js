import fetch from "node-fetch"
import yts from 'yt-search'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // 1. SI NO HAY TEXTO (MENÚ INICIAL)
    if (!text.trim()) {
        const pathImg = join(process.cwd(), 'storage', 'img', 'catalogo.png')
        let catalogoImg = existsSync(pathImg) ? readFileSync(pathImg) : { url: 'https://files.catbox.moe/t7uytz.png' }
        let txt = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   🎬  *𝙐𝘾𝙃𝙄𝙃𝘼 𝙔𝙊𝙐𝙏𝙐𝘽𝙀* \n╚════════════════════╝\n\n│ 👤 *𝙐𝙎𝙊:* ${usedPrefix + command} [nombre]\n│ 🌑 "𝘽𝙪𝙨𝙘𝙖 𝙩𝙪 𝙙𝙚𝙨𝙩𝙞𝙣𝙤..."`
        return await conn.sendMessage(m.chat, { 
            image: (catalogoImg.byteLength ? catalogoImg : { url: catalogoImg.url }), 
            caption: txt, 
            footer: "𝑩𝒚 𝑩𝒂𝒓𝒃𝒐𝒛𝒂-𝑻𝒆𝒂𝒎 ⚡"
        }, { quoted: m })
    }

    const isAudio = /^(yta|ytmp3)$/i.test(command)
    const isVideo = /^(ytv|ytmp4)$/i.test(command)
    const isDocMp3 = /^(ytmp3doc)$/i.test(command)
    const isDocMp4 = /^(ytmp4doc)$/i.test(command)

    // 2. LÓGICA DE DESCARGA
    if (isAudio || isVideo || isDocMp3 || isDocMp4) {
        if (m.react) await m.react('📥')
        try {
            // Intentar con API 1 (Delirius)
            let res = await fetch(`https://api.delirius.store/download/ytmp3v2?url=${encodeURIComponent(text)}`)
            let json = await res.json()
            
            let dlUrl = json.data?.download
            let titulo = json.data?.title || 'Archivo'

            // SI FALLA DELIRIUS, INTENTAR API 2 (Fallback)
            if (!dlUrl) {
                let res2 = await fetch(`https://api.lolhuman.xyz/api/yt2mate?apikey=GataDios&url=${encodeURIComponent(text)}`)
                let json2 = await res2.json()
                dlUrl = json2.result?.link || json2.result?.url
            }

            if (!dlUrl) throw 'Error en todas las fuentes'

            if (isAudio) {
                return await conn.sendMessage(m.chat, { audio: { url: dlUrl }, mimetype: 'audio/mpeg' }, { quoted: m })
            }
            if (isVideo) {
                return await conn.sendMessage(m.chat, { video: { url: dlUrl }, caption: `✅ *𝙑𝙞𝙙𝙚𝙤:* ${titulo}` }, { quoted: m })
            }
            if (isDocMp3) {
                return await conn.sendMessage(m.chat, { document: { url: dlUrl }, mimetype: 'audio/mpeg', fileName: `${titulo}.mp3` }, { quoted: m })
            }
            if (isDocMp4) {
                return await conn.sendMessage(m.chat, { document: { url: dlUrl }, mimetype: 'video/mp4', fileName: `${titulo}.mp4` }, { quoted: m })
            }

        } catch (e) {
            console.error(e)
            if (m.react) await m.react('❌')
            return m.reply(`🛑 *𝙀𝙧𝙧𝙤𝙧:* No se pudo procesar la descarga. IP saturada o enlace roto.`)
        }
        return 
    }

    // 3. BUSCADOR
    try {
        if (m.react) await m.react('⏳')
        const search = await yts(text)
        const result = search.videos[0]
        if (!result) return m.reply('❌ Sin resultados.')

        const videoUrl = result.url
        let info = `╔══🔥 • 𝕾𝕬𝕾𝖀𝕶𝕰 𝕭𝕺𝕿 • 🔥══╗\n   🎵  *𝙔𝙊𝙐𝙏𝙐𝘽𝙀 𝙋𝙇𝘼𝙔* \n╚════════════════════╝\n\n`
        info += `│ 👤 *𝘾𝘼𝙉𝘼𝙇:* ${result.author.name}\n`
        info += `│ 🎵 *𝙏𝙄𝙏𝙐𝙇𝙊:* ${result.title}\n`
        info += `│ ⏱️ *𝘿𝙐𝙍𝘼𝘾𝙄𝙊𝙉:* ${result.timestamp}\n\n`
        info += `> *𝙀𝙨𝙘𝙧𝙞𝙗𝙖 el comando para descargar:*\n`
        info += `👉 *${usedPrefix}yta* (Audio)\n`
        info += `👉 *${usedPrefix}ytv* (Video)\n`
        info += `👉 *${usedPrefix}ytmp3doc* (Documento)`

        await conn.sendMessage(m.chat, { 
            image: { url: result.thumbnail }, 
            caption: info
        }, { quoted: m })

        if (m.react) await m.react('✅')
    } catch (e) {
        if (m.react) await m.react('❌')
    }
}

handler.command = /^(play|yta|ytmp3|play2|ytv|mp4|ytmp4|ytmp3doc|ytmp4doc)$/i
export default handler
