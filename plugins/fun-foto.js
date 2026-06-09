import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let entrada = text || (m.quoted && m.quoted.text ? m.quoted.text : '')

    if (!entrada.trim()) {
        return conn.reply(m.chat, `❌ Inserte el texto de búsqueda.\n\nEjemplo:\n> ${usedPrefix + command} Messi`, m)
    }

    await m.react('🔍')
    try {
        const apiSearch = "https://api.delirius.store/search/stickerly"
        const rutaSearch = `${apiSearch}?query=${encodeURIComponent(entrada)}`
        
        let resSearch = await fetch(rutaSearch)
        let jsonSearch = await resSearch.json()

        if (!jsonSearch || jsonSearch.status !== true || !jsonSearch.data || jsonSearch.data.length === 0) {
            await m.react('❌')
            return conn.reply(m.chat, '❌ No se encontraron paquetes para esa búsqueda.', m)
        }

        const primerPackUrl = jsonSearch.data[0].url
        const nombrePack = jsonSearch.data[0].name

        const apiDownload = "https://api.delirius.store/download/stickerly"
        const rutaPeticion = `${apiDownload}?url=${encodeURIComponent(primerPackUrl)}`
        
        let respuestaServidor = await fetch(rutaPeticion)
        let datosJson = await respuestaServidor.json()

        if (datosJson && datosJson.status === true && datosJson.data && datosJson.data.stickers) {
            const listaStickers = datosJson.data.stickers.slice(0, 5)

            for (let stickerUrl of listaStickers) {
                let resSticker = await fetch(stickerUrl)
                let arrayBuffer = await resSticker.arrayBuffer()
                let buffer = Buffer.from(arrayBuffer)

                await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
            }

            await m.react('✅')
        } else {
            await m.react('❌')
            return conn.reply(m.chat, `❌ No se pudieron obtener los stickers del primer paquete.`, m)
        }

    } catch (error) {
        console.error(error)
        await m.react('❌')
        return conn.reply(m.chat, `⚠️ Error: ${error.message}`, m)
    }
}

handler.help = ['stickerly']
handler.tags = ['dl']
handler.command = ['stickerly']

export default handler
