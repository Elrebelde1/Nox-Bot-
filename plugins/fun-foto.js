import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let txt = text ? text.trim() : ''

    // 1. Validar que el usuario ingrese un enlace o un texto a buscar
    if (!txt) {
        return conn.reply(m.chat, `💡 *Uso correcto:*\n\n*Para descargar un pack directo:* \n> *${usedPrefix + command} https://sticker.ly/s/XXXXXX*\n\n*Para buscar packs:*\n> *${usedPrefix + command} [término de búsqueda]*`, m)
    }

    // Detectar si el texto ingresado es un enlace directo de Sticker.ly
    let esEnlace = txt.match(/sticker\.ly\/s\/|sticker\.ly\/p\//i)

    if (esEnlace) {
        await m.react('⏳')
        try {
            let resDl, jsonDl
            let exito = false
            let stickersList = []
            let packName = 'Sticker Pack'

            // --- 1ra Opción: API Sylphyy (Preferencia) ---
            try {
                resDl = await fetch(`https://sylphyy.xyz/download/stickerly?url=${encodeURIComponent(txt)}&api_key=sylphy-6f150d`)
                jsonDl = await resDl.json()
                if (jsonDl && jsonDl.status === true && jsonDl.result) {
                    packName = jsonDl.result.name || packName
                    stickersList = jsonDl.result.stickers || []
                    exito = true
                }
            } catch (e) {
                console.error("Error en API Sylphyy (Download):", e)
            }

            // --- 2da Opción: API Delirius (Respaldo) ---
            if (!exito) {
                try {
                    resDl = await fetch(`https://api.delirius.store/download/stickerly?url=${encodeURIComponent(txt)}`)
                    jsonDl = await resDl.json()
                    if (jsonDl && jsonDl.status === true && jsonDl.data) {
                        packName = jsonDl.data.name || packName
                        stickersList = jsonDl.data.stickers || []
                        exito = true
                    }
                } catch (e) {
                    console.error("Error en API Delirius (Download):", e)
                }
            }

            // Si ninguna API respondió con éxito
            if (!exito || stickersList.length === 0) {
                await m.react('❌')
                return conn.reply(m.chat, `❌ No se pudieron recuperar los stickers de este enlace con ninguna de las APIs activas.`, m)
            }

            await m.react('📦')
            
            // Enviar los stickers uno por uno respondiendo al mensaje (tal como se ve en tu captura)
            // Limitado a los primeros 10 para evitar baneos o saturación del flujo
            let limite = Math.min(10, stickersList.length)
            for (let i = 0; i < limite; i++) {
                let st = stickersList[i]
                let sUrl = typeof st === 'string' ? st : (st.imageUrl || st.thumbnailUrl)

                if (sUrl) {
                    await conn.sendMessage(m.chat, { 
                        sticker: { url: sUrl } 
                    }, { 
                        quoted: m // Responde directamente al mensaje para mantener el formato de la captura
                    }).catch(err => console.error(`Error enviando sticker ${i}:`, err))
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

    // 2. Si el texto NO es un enlace, realiza una búsqueda normal en formato texto plano
    await m.react('🔍')
    try {
        let resSearch, jsonSearch
        let lista = []
        let exitoSearch = false

        // --- 1ra Opción Búsqueda: Sylphyy (Preferencia) ---
        try {
            resSearch = await fetch(`https://sylphyy.xyz/search/stickerly?q=${encodeURIComponent(txt)}&api_key=sylphy-6f150d`)
            jsonSearch = await resSearch.json()
            if (jsonSearch && jsonSearch.status === true && jsonSearch.result && jsonSearch.result.length > 0) {
                lista = jsonSearch.result
                exitoSearch = true
            }
        } catch (e) {
            console.error("Error buscando en Sylphyy:", e)
        }

        // --- 2da Opción Búsqueda: Delirius (Respaldo) ---
        if (!exitoSearch) {
            try {
                resSearch = await fetch(`https://api.delirius.store/search/stickerly?query=${encodeURIComponent(txt)}`)
                jsonSearch = await resSearch.json()
                if (jsonSearch && jsonSearch.status === true && jsonSearch.data && jsonSearch.data.length > 0) {
                    lista = jsonSearch.data
                    exitoSearch = true
                }
            } catch (e) {
                console.error("Error buscando en Delirius:", e)
            }
        }

        if (!exitoSearch || lista.length === 0) {
            await m.react('❌')
            return conn.reply(m.chat, `❌ No se encontraron resultados para: *${txt}*`, m)
        }

        // Menú de resultados en texto plano (sin botones interactivos rotos)
        let menuTxt = `╭─〔 🏮 *𝚂𝚃𝙸𝙲𝙺𝙴𝚁.𝙻𝚈 𝚁𝙴𝚂𝚄𝙻𝚃𝚂* 〕─╮\n`
        menuTxt += `│\n`
        menuTxt += `│ ⚙️ *Packs encontrados para:* _${txt}_\n`
        menuTxt += `│ 💡 _Copia el enlace del pack que desees y envíalo con ${usedPrefix + command}_\n`
        menuTxt += `│\n`
        menuTxt += `╰─────────────────────────╯\n\n`

        let cont = 1
        for (let pack of lista.slice(0, 8)) { // Muestra un top 8 de resultados limpios
            let pName = pack.name || 'Pack Sin Nombre'
            let pUrl = pack.url || 'Sin enlace'
            menuTxt += `*${cont}.* 📦 *${pName}*\n`
            menuTxt += `🔗 _${pUrl}_\n\n`
            cont++
        }

        menuTxt += `⚡ *Barboza Developer* | ⛩️ _Uchiha Bot Net_`
        
        await m.react('✅')
        return conn.reply(m.chat, menuTxt, m)

    } catch (e) {
        console.error(e)
        await m.react('❌')
    }
}

handler.help = ['stickerly', 'stikerly']
handler.tags = ['tools']
handler.command = /^(stickerly|stikerly|ly|stickly)$/i

export default handler
