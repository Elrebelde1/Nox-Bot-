import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    conn.uchihaStickerly = conn.uchihaStickerly || {}

    let query = text ? text.trim() : ''
    let esBoton = text && text.includes('-pack:')

    if (esBoton) {
        let packUrl = text.split('-pack:')[1].trim()
        await m.react('⏳')
        try {
            let resDl, jsonDl
            let exito = false
            let stickersList = []
            let packName = 'Sticker Pack'

            try {
                resDl = await fetch(`https://api.delirius.store/download/stickerly?url=${encodeURIComponent(packUrl)}`)
                jsonDl = await resDl.json()
                if (jsonDl && jsonDl.status === true && jsonDl.data) {
                    packName = jsonDl.data.name || packName
                    stickersList = jsonDl.data.stickers || []
                    exito = true
                }
            } catch (e) {
                console.error("Error en API Delirius:", e)
            }

            if (!exito) {
                try {
                    resDl = await fetch(`https://sylphyy.xyz/download/stickerly?url=${encodeURIComponent(packUrl)}&api_key=sylphy-6f150d`)
                    jsonDl = await resDl.json()
                    if (jsonDl && jsonDl.status === true && jsonDl.result) {
                        packName = jsonDl.result.name || packName
                        stickersList = jsonDl.result.stickers || []
                        exito = true
                    }
                } catch (e) {
                    console.error("Error en API Sylphyy:", e)
                }
            }

            if (!exito || stickersList.length === 0) {
                await m.react('❌')
                return conn.reply(m.chat, `❌ No se pudieron descargar los stickers de este pack. Intenta con otro.`, m)
            }

            await m.react('📦')
            conn.reply(m.chat, `📥 *Descargando pack:* _${packName}_\n✨ Enviando los primeros *10 stickers* para evitar saturación...`, m)

            let limite = Math.min(10, stickersList.length)
            for (let i = 0; i < limite; i++) {
                let st = stickersList[i]
                let sUrl = typeof st === 'string' ? st : (st.imageUrl || st.thumbnailUrl)

                if (sUrl) {
                    await conn.sendMessage(m.chat, { 
                        sticker: { url: sUrl } 
                    }, { 
                        quoted: m 
                    }).catch(err => console.error(`Error al enviar sticker ${i}:`, err))
                }
            }
            await m.react('✅')
            return
        } catch (err) {
            console.error(err)
            await m.react('❌')
            return
        }
    }

    if (!query) {
        return conn.reply(m.chat, `💡 *Uso correcto:*\nIngresa el término que deseas buscar usando:\n> *${usedPrefix + command} [búsqueda]*`, m)
    }

    await m.react('🔍')
    try {
        let resSearch, jsonSearch
        let lista = []
        let exitoSearch = false

        try {
            resSearch = await fetch(`https://api.delirius.store/search/stickerly?query=${encodeURIComponent(query)}`)
            jsonSearch = await resSearch.json()
            if (jsonSearch && jsonSearch.status === true && jsonSearch.data && jsonSearch.data.length > 0) {
                lista = jsonSearch.data
                exitoSearch = true
            }
        } catch (e) {
            console.error("Error buscando en Delirius:", e)
        }

        if (!exitoSearch) {
            try {
                resSearch = await fetch(`https://sylphyy.xyz/search/stickerly?q=${encodeURIComponent(query)}&api_key=sylphy-6f150d`)
                jsonSearch = await resSearch.json()
                if (jsonSearch && jsonSearch.status === true && jsonSearch.result && jsonSearch.result.length > 0) {
                    lista = jsonSearch.result
                    exitoSearch = true
                }
            } catch (e) {
                console.error("Error buscando en Sylphyy:", e)
            }
        }

        if (!exitoSearch || lista.length === 0) {
            await m.react('❌')
            return conn.reply(m.chat, `❌ No se encontraron packs de stickers para: *${query}*`, m)
        }

        conn.uchihaStickerly[m.sender] = lista

        let txt1 = `╭─〔 🏮 *𝚂𝚃𝙸𝙲𝙺𝙴𝚁.𝙻𝚈 (𝟷/𝟹)* 〕─╮\n│\n│ 🌷 *sᴇbᴀsᴛɪᴀɴ, sᴇʟᴇᴄᴄɪᴏɴᴀ ᴜɴ ᴘᴀᴄᴋ:* \n╰─────────────────────────╯`
        const botones1 = []
        for (let i = 0; i < Math.min(3, lista.length); i++) {
            let targetUrl = lista[i].url || ''
            let pName = lista[i].name || 'Pack'
            botones1.push({
                buttonId: `${usedPrefix + command} -pack:${targetUrl}`.trim(),
                buttonText: { displayText: `✨ ${pName.substring(0, 20)}...` },
                type: 1
            })
        }
        await conn.sendMessage(m.chat, { text: txt1, footer: "By Barboza-Team ⚡", buttons: botones1, headerType: 4 }, { quoted: m })

        if (lista.length > 3) {
            let txt2 = `╭─〔 🏮 *𝚂𝚃𝙸𝙲𝙺𝙴𝚁.𝙻𝚈 (𝟸/𝟹)* 〕─╮\n│\n│ ⚙️ *ᴍᴀs ᴘᴀᴄᴋs ᴇɴᴄᴏɴᴛʀᴀᴅᴏs:* \n╰─────────────────────────╯`
            const botones2 = []
            for (let i = 3; i < Math.min(6, lista.length); i++) {
                let targetUrl = lista[i].url || ''
                let pName = lista[i].name || 'Pack'
                botones2.push({
                    buttonId: `${usedPrefix + command} -pack:${targetUrl}`.trim(),
                    buttonText: { displayText: `✨ ${pName.substring(0, 20)}...` },
                    type: 1
                })
            }
            await conn.sendMessage(m.chat, { text: txt2, footer: "By Barboza-Team ⚡", buttons: botones2, headerType: 4 })
        }

        if (lista.length > 6) {
            let txt3 = `╭─〔 🏮 *𝚂𝚃𝙸𝙲𝙺𝙴𝚁.𝙻𝚈 (𝟹/𝟹)* 〕─╮\n│\n│ ⛩️ *ᴏᴘᴄɪᴏɴᴇs ᴀᴅɪᴄɪᴏɴᴀʟᴇs:* \n╰─────────────────────────╯`
            const botones3 = []
            for (let i = 6; i < Math.min(9, lista.length); i++) {
                let targetUrl = lista[i].url || ''
                let pName = lista[i].name || 'Pack'
                botones3.push({
                    buttonId: `${usedPrefix + command} -pack:${targetUrl}`.trim(),
                    buttonText: { displayText: `✨ ${pName.substring(0, 20)}...` },
                    type: 1
                })
            }
            return conn.sendMessage(m.chat, { text: txt3, footer: "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕\n👤 𝖢𝗋𝖾𝖺𝖽𝗈𝗋: 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓", buttons: botones3, headerType: 4 })
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
    }
}

handler.help = ['stickerly', 'stikerly']
handler.tags = ['tools']
handler.command = /^(stickerly|stikerly|ly|stickly)$/i

export default handler
