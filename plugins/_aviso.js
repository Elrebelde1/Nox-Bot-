

import fetch from "node-fetch"
import fs from "fs"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const _0x4f21 = 'ZWt1c2Fz'
    const apiKey = Buffer.from(_0x4f21, 'base64').toString('utf-8').split('').reverse().join('')
    
    const dev = "Barboza Developer"
    const chn = "Zona Developers"

    try {
        const self = fs.readFileSync('./plugins/Textplay.js', 'utf-8')
        if (!self.includes(dev) || !self.includes(chn)) {
            return console.log('Créditos removidos detectados.')
        }
    } catch { 
        /* Error silencioso si no encuentra el archivo */ 
    }

    if (!text.trim()) {
        return conn.reply(m.chat, `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝙰𝙿𝙺* ♆ 〕─╮\n│\n│ 📥 *𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n│ ${usedPrefix + command} [app]\n│\n│ 🌑 "ᴛᴏᴅᴏ ᴇʟ ᴘᴏᴅᴇʀ ᴅᴇʟ sᴏғᴛᴡᴀʀᴇ"\n╰────────────────────────────╯`, m)
    }

    if (m.react) await m.react('⏳')

    try {
        let resGata = await fetch(`https://api.evogb.org/search/apk?query=${encodeURIComponent(text)}&key=${apiKey}`)
        let jsonGata = await resGata.json()

        if (!jsonGata.status || !jsonGata.data) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ No se encontró la aplicación.', m)
        }

        const appData = jsonGata.data
        let resDeli = await fetch(`https://api.delirius.store/download/apk?query=${encodeURIComponent(appData.name)}`)
        let jsonDeli = await resDeli.json()

        const dlUrl = jsonDeli?.data?.download
        
        let info = `「 🎬 𝚄𝙲𝙷𝙸𝙷𝙰 𝙰𝙿𝙺 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 📦 *𝙽𝙾𝙼𝙱𝚁𝙴:* ${appData.name}\n`
        info += `│ ⚖️ *𝚃𝙰𝙼𝙰𝙽𝙾:* ${appData.size}\n`
        info += `│ 📅 *𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙾:* ${appData.lastUpdated}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `🚀 *Descargando archivo desde Api Gata...*\n\n`
        info += `⚡ *By: ${dev}*\n`
        info += `📡 *Canal:* ${chn}\n`
        info += `👑 *API: GataDios*`

        if (!info.includes(dev)) return

        await conn.sendMessage(m.chat, { 
            image: { url: appData.banner }, 
            caption: info,
            footer: "Barboza-Team ⚡"
        }, { quoted: m })

        await conn.sendMessage(m.chat, { 
            document: { url: dlUrl }, 
            mimetype: 'application/vnd.android.package-archive', 
            fileName: `${appData.name}.apk` 
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        if (m.react) await m.react('❌')
        conn.reply(m.chat, '🛑 Error en el sistema de descarga.', m)
    }
}

handler.help = ['apk']
handler.tags = ['downloader']
handler.command = /^(apk1|dapk|modapk)$/i

export default handler
