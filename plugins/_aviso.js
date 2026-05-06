import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    // Ofuscación de Key
    const _0x1a2b = 'ZWt1c2Fz'
    const apiKey = Buffer.from(_0x1a2b, 'base64').toString('utf-8').split('').reverse().join('')
    
    // CONSTANTES DE INTEGRIDAD (NO TOCAR)
    const autor = "k Developer"
    const canal = "xd"
    const team = "a"

    if (!text.trim()) {
        return conn.reply(m.chat, `╭─〔 ♆ *𝚄𝙲𝙷𝙸𝙷𝙰 𝙰𝙿𝙺* ♆ 〕─╮\n│\n│ 📥 *𝚄𝚂𝙾 𝙲𝙾𝚁𝚁𝙴𝙲𝚃𝙾:* \n│ ${usedPrefix + command} [app]\n│\n│ 🌑 "ᴛᴏᴅᴏ ᴇʟ ᴘᴏᴅᴇʀ ᴅᴇʟ sᴏғᴛᴡᴀʀᴇ"\n╰────────────────────────────╯`, m)
    }

    if (m.react) await m.react('⏳')

    try {    
        let resGata = await fetch(`https://api.evogb.org/search/apk?query=${encodeURIComponent(text)}&key=${apiKey}`)
        let jsonGata = await resGata.json()

        if (!jsonGata.status || !jsonGata.data) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ No se encontró información.', m)
        }

        const appData = jsonGata.data
        let resDeli = await fetch(`https://api.delirius.store/download/apk?query=${encodeURIComponent(appData.name)}`)
        let jsonDeli = await resDeli.json()

        if (!jsonDeli.status || !jsonDeli.data) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '❌ Error al procesar descarga.', m)
        }

        const dlUrl = jsonDeli.data.download
        
        // CONSTRUCCIÓN DEL CAPTION
        let info = `「 🎬 𝚄𝙲𝙷𝙸𝙷𝙰 𝙰𝙿𝙺 」\n─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        info += `│ 📦 *𝙽𝙾𝙼𝙱𝚁𝙴:* ${appData.name}\n`
        info += `│ ⚖️ *𝚃𝙰𝙼𝙰𝙽𝙾:* ${appData.size}\n`
        info += `│ 📅 *𝙰𝙲𝚃𝚄𝙰𝙻𝙸𝚉𝙰𝙳𝙾:* ${appData.lastUpdated}\n`
        info += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        info += `🚀 *Descargando archivo desde Api Gata...*\n\n`
        info += `⚡ *By: ${autor}*\n`
        info += `📡 *Canal:* ${canal}\n`
        info += `👑 *API: GataDios*`

        // SISTEMA ANTI-ROBO: Si el texto no contiene tus créditos exactos, el código muere aquí
        if (!info.includes(autor) || !info.includes(canal)) return

        await conn.sendMessage(m.chat, { 
            image: { url: appData.banner }, 
            caption: info,
            footer: team
        }, { quoted: m })

        // Verificación doble antes de soltar el archivo
        if (info.indexOf(autor) === -1) return

        await conn.sendMessage(m.chat, { 
            document: { url: dlUrl }, 
            mimetype: 'application/vnd.android.package-archive', 
            fileName: `${appData.name}.apk` 
        }, { quoted: m })

        if (m.react) await m.react('✅')

    } catch (e) {
        if (m.react) await m.react('❌')
        conn.reply(m.chat, '🛑 Error en el proceso de descarga.', m)
    }
}

handler.help = ['apk']
handler.tags = ['downloader']
handler.command = /^(apk2|dapk|modapk)$/i

export default handler
