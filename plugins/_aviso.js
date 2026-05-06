/**
 * 📂 COMANDO: Uchiha APK Pro (Dual Engine)
 * 📝 DESCRIPCIÓN: Búsqueda con Gata y descarga con Delirius.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: Gata (Search) | Delirius (Download)
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const apiKey = 'sasuke'

    if (!text.trim()) {
        let txt = `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝙰𝙿𝙺* ♆ 〕─╮\n│\n│ 📥 *𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n│ ${usedPrefix + command} [nombre de la app]\n│\n│ 🌑 "ᴛᴏᴅᴏ ᴇʟ ᴘᴏᴅᴇʀ ᴅᴇʟ sᴏғᴛᴡᴀʀᴇ"\n╰────────────────────────────╯`
        return conn.reply(m.chat, txt, m)
    }

    if (m.react) await m.react('⏳')

    try {
        // 1. BÚSQUEDA DE DATOS CON API DE GATA
        let resGata = await fetch(`https://api.evogb.org/search/apk?query=${encodeURIComponent(text)}&key=${apiKey}`)
        let jsonGata = await resGata.json()

        if (!jsonGata.status || !jsonGata.data) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ No se encontró información de la aplicación.', m)
        }

        const appData = jsonGata.data

        // 2. OBTENER ENLACE DE DESCARGA CON API DE DELIRIUS
        let resDeli = await fetch(`https://api.delirius.store/download/apk?query=${encodeURIComponent(appData.name)}`)
        let jsonDeli = await resDeli.json()

        if (!jsonDeli.status || !jsonDeli.data) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ Error al generar el enlace de descarga en Delirius.', m)
        }

        const dlUrl = jsonDeli.data.download

        // CONSTRUCCIÓN DEL MENSAJE INFORMATIVO
        let info = `「 🎬 𝚄𝙲𝙷𝙸𝙷𝙰 𝙰𝙿𝙺 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 📦 *𝙽𝙾𝙼𝙱𝚁𝙴:* ${appData.name}\n`
        info += `│ ⚖️ *𝚃𝙰𝙼𝙰𝙽𝙾:* ${appData.size}\n`
        info += `│ 📅 *𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙾:* ${appData.lastUpdated}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `🚀 *Descargando archivo desde Delirius...*\n\n`
        info += `⚡ *By: Barboza Developer*`

        // Enviamos miniatura e información
        await conn.sendMessage(m.chat, { 
            image: { url: appData.banner }, 
            caption: info,
            footer: "By Barboza-Team ⚡"
        }, { quoted: m })

        // 3. ENVÍO DEL ARCHIVO APK
        await conn.sendMessage(m.chat, { 
            document: { url: dlUrl }, 
            mimetype: 'application/vnd.android.package-archive', 
            fileName: `${appData.name}.apk` 
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        console.error(e)
        if (m.react) await m.react('❌')
        conn.reply(m.chat, '🛑 Error en el proceso de búsqueda o descarga.', m)
    }
}

handler.help = ['apk']
handler.tags = ['downloader']
handler.command = /^(apk2|dapk|modapk)$/i

export default handler
