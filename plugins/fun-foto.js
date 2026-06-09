import fetch from "node-fetch"

global.buscarSticker = global.buscarSticker || {}

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let entrada = text || (m.quoted && m.quoted.text ? m.quoted.text : '')

    if (!entrada.trim()) {
        return conn.reply(m.chat, `❌ Inserte un link de Sticker.ly o el texto que desea buscar.\n\nEjemplo:\n> ${usedPrefix + command} https://sticker.ly/s/MPTYYK\n> ${usedPrefix + command} my melody`, m)
    }

    const esLink = /sticker\.ly\/s\//i.test(entrada)

    if (esLink) {
        await m.react('⏳')
        return descargarYEnviar(entrada, m, conn)
    }

    if (global.buscarSticker[m.sender] && /^\d+$/.test(entrada)) {
        const indice = parseInt(entrada) - 1
        const packsGuardados = global.buscarSticker[m.sender]

        if (indice >= 0 && indice < packsGuardados.length) {
            const urlSeleccionada = packsGuardados[indice].url
            delete global.buscarSticker[m.sender]
            await m.react('⏳')
            return descargarYEnviar(urlSeleccionada, m, conn)
        }
    }

    await m.react('🔍')
    try {
        const apiSearch = "https://api.delirius.store/search/stickerly"
        const rutaSearch = `${apiSearch}?query=${encodeURIComponent(entrada)}`
        
        let resSearch = await fetch(rutaSearch)
        let jsonSearch = await resSearch.json()

        if (!jsonSearch || jsonSearch.status !== true || !jsonSearch.data || jsonSearch.data.length === 0) {
            await m.react('❌')
            return conn.reply(m.chat, '❌ No se encontraron paquetes de stickers.', m)
        }

        const topPacks = jsonSearch.data.slice(0, 5)
        global.buscarSticker[m.sender] = topPacks

        let mensajeBusqueda = `🏮 Sticker.ly Search ⚡\n`
        mensajeBusqueda += `╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴╴\n\n`
        mensajeBusqueda += `Responde con el número del paquete que deseas descargar:\n\n`

        topPacks.forEach((pack, i) => {
            mensajeBusqueda += `*${i + 1}.* ${pack.name}\n`
            mensajeBusqueda += `├ Cantidad: ${pack.sticker_count}\n`
            mensajeBusqueda += `└ Autor: ${pack.author || 'N/A'}\n\n`
        })

        mensajeBusqueda += `> Responde solo con el número\n`
        mensajeBusqueda += `⛩️ Barboza Developer`

        await conn.reply(m.chat, mensajeBusqueda, m)

    } catch (error) {
        console.error(error)
        await m.react('❌')
        return conn.reply(m.chat, `⚠️ Error: ${error.message}`, m)
    }
}

async function descargarYEnviar(url, m, conn) {
    try {
        const apiDownload = "https://api.delirius.store/download/stickerly"
        const rutaPeticion = `${apiDownload}?url=${encodeURIComponent(url)}`
        
        let respuestaServidor = await fetch(rutaPeticion)
        let datosJson = await respuestaServidor.json()

        if (datosJson && datosJson.status === true && datosJson.data && datosJson.data.stickers) {
            const listaStickers = datosJson.data.stickers
            const nombrePack = datosJson.data.name || 'Pack'

            await conn.reply(m.chat, `📦 Descargando e ingresando los stickers del paquete:\n*${nombrePack}*...`, m)

            for (let stickerUrl of listaStickers) {
                let resSticker = await fetch(stickerUrl)
                let arrayBuffer = await resSticker.arrayBuffer()
                let buffer = Buffer.from(arrayBuffer)

                await conn.sendMessage(m.chat, { sticker: buffer }, { quoted: m })
            }

            await m.react('✅')
        } else {
            await m.react('❌')
            return conn.reply(m.chat, `❌ No se pudieron obtener los stickers de este enlace.`, m)
        }
    } catch (e) {
        console.error(e)
        await m.react('❌')
        return conn.reply(m.chat, `⚠️ Error: ${e.message}`, m)
    }
}

handler.help = ['stickerly']
handler.tags = ['dl']
handler.command = ['stickerly']

export default handler
