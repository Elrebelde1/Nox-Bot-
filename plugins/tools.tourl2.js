/**
 * 📂 COMANDO: Uchiha Cloud Upload Unified
 * 📝 DESCRIPCIÓN: Aloja imágenes y archivos multimedia en múltiples servidores de la nube de forma dinámica.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import FormData from "form-data"
import fetch from "node-fetch"
import { fileTypeFromBuffer } from "file-type"
import crypto from "crypto"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.uchihaUploads = conn.uchihaUploads || {}

    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let urlImagen = text ? text.split(' ')[0] : (m.quoted && m.quoted.text ? m.quoted.text.split(' ')[0] : '')

    let tieneServidor = text && text.includes('-server:')
    let servidorSeleccionado = 'auto'

    if (tieneServidor) {
        servidorSeleccionado = text.split('-server:')[1].trim()
    }

    // ---------------------------------------------------------
    // FLUJO INICIAL: Guardar multimedia y mostrar todos los servidores en botones nativos
    // ---------------------------------------------------------
    if (!tieneServidor && (/^https?:\/\//i.test(urlImagen) || mime)) {
        if (mime) {
            try {
                let bufferMedia = await q.download()
                conn.uchihaUploads[m.sender] = {
                    buffer: bufferMedia,
                    mime: mime
                }
            } catch (err) {
                console.error(err)
            }
        }

        // BLOQUE 1: Servidores Permanentes Principales
        let txt1 = `╭─〔 ☁️ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚄𝙿𝙻𝙾𝙰𝙳 (𝟷/𝟹)* 〕─╮\n│\n│ 💠 *sᴇʟᴇᴄᴄɪᴏɴᴀ ᴜɴ sᴇʀᴠɪᴅᴏʀ ᴘᴇʀᴍᴀɴᴇɴᴛᴇ:* \n╰────────────────────────────╯`
        const botones1 = [
            { buttonId: `${usedPrefix + command} ${urlImagen} -server:auto`.trim(), buttonText: { displayText: "🤖 Automático" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${urlImagen} -server:evogb`.trim(), buttonText: { displayText: "🌐 Evogb.win" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${urlImagen} -server:catbox`.trim(), buttonText: { displayText: "📦 Catbox.moe" }, type: 1 }
        ]
        await conn.sendMessage(m.chat, { text: txt1, footer: "By Barboza-Team ⚡", buttons: botones1, headerType: 4 }, { quoted: m })

        // BLOQUE 2: Servidores Temporales Rápidos
        let txt2 = `╭─〔 ☁️ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚄𝙿𝙻𝙾𝙰𝙳 (𝟸/𝟹)* 〕─╮\n│\n│ ⚙️ *sᴇʟᴇᴄᴄɪᴏɴᴀ ᴜɴ sᴇʀᴠɪᴅᴏʀ ᴛᴇᴍᴘᴏʀᴀʟ:* \n╰────────────────────────────╯`
        const botones2 = [
            { buttonId: `${usedPrefix + command} ${urlImagen} -server:uguu`.trim(), buttonText: { displayText: "💧 Uguu.se" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${urlImagen} -server:quax`.trim(), buttonText: { displayText: "🦅 Qu.ax" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${urlImagen} -server:top4top`.trim(), buttonText: { displayText: "🔝 Top4top.io" }, type: 1 }
        ]
        await conn.sendMessage(m.chat, { text: txt2, footer: "By Barboza-Team ⚡", buttons: botones2, headerType: 4 })

        // BLOQUE 3: Servidores Alternativos de Respaldo
        let txt3 = `╭─〔 ☁️ *𝚄𝙲𝙷𝙸𝙷𝙰 𝚄𝙿𝙻𝙾𝙰𝙳 (𝟹/𝟹)* 〕─╮\n│\n│ 🛠️ *ᴏᴘᴄɪᴏɴᴇs ᴀᴅɪᴄɪᴏɴᴀʟᴇs ᴅᴇ sᴜʙɪᴅᴀ:* \n╰────────────────────────────╯`
        const botones3 = [
            { buttonId: `${usedPrefix + command} ${urlImagen} -server:zenzxz`.trim(), buttonText: { displayText: "🌌 Zenzxz" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${urlImagen} -server:puticu`.trim(), buttonText: { displayText: "⏱️ Put.icu (24H)" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${urlImagen} -server:adoolab`.trim(), buttonText: { displayText: "🧪 Adoolab" }, type: 1 }
        ]
        return conn.sendMessage(m.chat, { text: txt3, footer: "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕\n👤 𝖢𝗋𝖾𝖺𝖽𝗈𝗋: 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓", buttons: botones3, headerType: 4 })
    }

    let cacheMedia = conn.uchihaUploads[m.sender]

    if (!/^https?:\/\//i.test(urlImagen) && !mime && !cacheMedia) {
        return conn.reply(m.chat, `💡 *Uso correcto:*\nResponde a una imagen o ingresa un enlace usando:\n> *${usedPrefix + command} [enlace]*`, m)
    }

    const endpoint = "https://api.evogb.org/tools/upload"
    const claveOculta = Buffer.from("c2FzdWtl", 'base64').toString('utf-8')

    // ---------------------------------------------------------
    // METODO 1: VIA LINK / ENLACE (GET)
    // ---------------------------------------------------------
    if (/^https?:\/\//i.test(urlImagen) && !mime) {
        await m.react('☁️')
        try {
            const queryUrl = `${endpoint}?key=${claveOculta}&method=url&server=${servidorSeleccionado}&url=${encodeURIComponent(urlImagen)}`
            let response = await fetch(queryUrl)
            let datosJson = await response.json()

            if (datosJson && datosJson.status === true && datosJson.url) {
                await m.react('🔥')
                return conn.reply(m.chat, `🚀 *UPLOAD REMOTE SUCCESS*\n\n🔗 *ENLACE:* ${datosJson.url}\n📡 *SERVIDOR:* ${datosJson.server || servidorSeleccionado}\n\n⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓\n⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕`, m)
            } else {
                await m.react('❌')
                return conn.reply(m.chat, `❌ Error en el servidor remoto de evogb.org.\n🔴 ${datosJson?.message || 'Sin respuesta'}`, m)
            }
        } catch (e) {
            console.error(e)
            await m.react('❌')
        }
    } 
    // ---------------------------------------------------------
    // METODO 2: VIA RESPUESTA A IMAGEN / PROCESAMIENTO (POST)
    // ---------------------------------------------------------
    else if (mime || cacheMedia) {
        await m.react('⏳')
        try {
            let bufferMedia = mime ? await q.download() : cacheMedia.buffer
            let currentMime = mime ? mime : cacheMedia.mime

            if (mime) {
                conn.uchihaUploads[m.sender] = {
                    buffer: bufferMedia,
                    mime: mime
                }
            }

            const fileInfo = await fileTypeFromBuffer(bufferMedia) || { ext: 'bin', mime: currentMime || 'application/octet-stream' }

            const extOverrides = {
                'application/vnd.android.package-archive': 'apk',
                'application/x-rar-compressed': 'rar',
                'application/x-7z-compressed': '7z',
                'application/x-tar': 'tar',
            }

            const ext = extOverrides[fileInfo.mime] || fileInfo.ext
            const filename = 'media-' + crypto.randomBytes(8).toString('hex') + '.' + ext

            let formulario = new FormData()
            formulario.append('file', bufferMedia, { filename, contentType: fileInfo.mime })
            formulario.append('method', 'local')
            formulario.append('server', servidorSeleccionado)

            const queryLocal = `${endpoint}?key=${claveOculta}`
            let respuestaServidor = await fetch(queryLocal, {
                method: 'POST',
                body: formulario,
                headers: {
                    ...formulario.getHeaders(),
                    'User-Agent': 'Mozilla/5.0'
                }
            })
            let datosJsonLocal = await respuestaServidor.json()

            if (datosJsonLocal && datosJsonLocal.status === true && datosJsonLocal.url) {
                // Limpieza del almacenamiento temporal tras una subida exitosa
                delete conn.uchihaUploads[m.sender]
                await m.react('🔥')
                return conn.reply(m.chat, `⚡ *UPLOAD LOCAL SUCCESS*\n\n🔗 *ENLACE:* ${datosJsonLocal.url}\n📡 *SERVIDOR:* ${datosJsonLocal.server || servidorSeleccionado}\n\n⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓\n⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕`, m)
            } else {
                await m.react('❌')
                return conn.reply(m.chat, `❌ No se pudo procesar la subida binaria del archivo.\n🔴 ${datosJsonLocal?.message || 'Sin respuesta válida'}`, m)
            }
        } catch (err) {
            console.error(err)
            await m.react('❌')
        }
    }
}

handler.help = ['upload', 'tourl']
handler.tags = ['tools']
handler.command = /^(upload|tourl|subir)$/i

export default handler
