import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Ofuscación de Key
    const _0x4f21 = 'ZWt1c2Fz'
    const apiKey = Buffer.from(_0x4f21, 'base64').toString('utf-8').split('').reverse().join('')
    
    // INTEGRIDAD: Si se cambia esto, el código se rompe
    const dev = "Barboza Develope"
    const chn = "Zona Developer"
    const verify = Buffer.from(dev).toString('base64')

    if (!text.trim()) {
        return conn.reply(m.chat, `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝙰𝙿𝙺* ♆ 〕─╮\n│\n│ 📥 *𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n│ ${usedPrefix + command} [app]\n│\n│ 🌑 "ᴛᴏᴅᴏ ᴇʟ ᴘᴏᴅᴇʀ ᴅᴇʟ sᴏғᴛᴡᴀʀᴇ"\n╰────────────────────────────╯`, m)
    }

    if (m.react) await m.react('⏳')

    try {
        // VALIDACIÓN SILENCIOSA
        if (verify !== 'QmFyYm96YSBEZXZlbG9wZXI=') {
            return conn.reply(m.chat, '🛑 Error: Invalid API Key (0x882)', m)
        }

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

        // Check final de texto
        if (!info.includes(dev) || !info.includes(chn)) return

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
        conn.reply(m.chat, '🛑 Error interno en el sistema.', m)
    }
}

handler.help = ['apk']
handler.tags = ['downloader']
handler.command = /^(apk1|dapk|modapk)$/i

export default handler
