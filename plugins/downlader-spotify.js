/**
 * 📂 COMANDO: Uchiha Spotify Play Dynamic System
 * 📝 DESCRIPCIÓN: Busca canciones en Spotify y las descarga automáticamente en formato de audio MP3 junto con su carátula.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let busqueda = text || (m.quoted && m.quoted.text ? m.quoted.text : '')

    if (!busqueda) {
        let menuFallo = `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓\n`
        menuFallo += `┃ 🔍 *UCHIHA SPOTIFY SYSTEM* 🔍\n`
        menuFallo += `┃━━━━━━━━━━━━━━━━━━━━━━━━━━━━┃\n`
        menuFallo += `┃ ⚠️ *ESTADO:* Texto de búsqueda ausente.\n`
        menuFallo += `┃ 📌 *ACCIÓN:* Ingrese el nombre de una canción o enlace.\n`
        menuFallo += `┃\n`
        menuFallo += `┃ 💡 *EJEMPLO:* \n`
        menuFallo += `┃ > ${usedPrefix + command} Lupita\n`
        menuFallo += `┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
        return conn.reply(m.chat, menuFallo, m)
    }

    await m.react('🎧')

    try {
        const tokenB64 = process.env.SPOTIFY_KEY || Buffer.from("c2FzdWtl", 'base64').toString('utf-8')
        const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
        const net = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"

        let enlaceSpotify = busqueda

        if (!busqueda.includes('spotify.com/track/')) {
            const apiSearch = "https://api.evogb.org/search/spotify"
            let endpointSearch = `${apiSearch}?query=${encodeURIComponent(busqueda)}&key=${tokenB64}`
            
            let conexionSearch = await fetch(endpointSearch)
            let jsonSearch = await conexionSearch.json()

            if (jsonSearch && jsonSearch.status === true && jsonSearch.result && jsonSearch.result.length > 0) {
                enlaceSpotify = jsonSearch.result[0].link
            } else {
                await m.react('❌')
                return conn.reply(m.chat, `❌ No se encontraron resultados en Spotify para la búsqueda especificada.`, m)
            }
        }

        const apiDl = "https://api.evogb.org/dl/spotify"
        const endpointDl = `${apiDl}?url=${encodeURIComponent(enlaceSpotify)}&key=${tokenB64}`

        let conexionDl = await fetch(endpointDl)
        let jsonDl = await conexionDl.json()

        if (jsonDl && jsonDl.status === true && jsonDl.data && jsonDl.data.url) {
            const streamUrl = jsonDl.data.url
            const caratula = jsonDl.data.imageHD || jsonDl.data.image
            const nombreCancion = jsonDl.data.name || 'Desconocido'
            const artista = jsonDl.data.artist || 'Desconocido'
            const album = jsonDl.data.album || 'Desconocido'
            const duracion = jsonDl.data.duration || 'Desconocido'
            const anio = jsonDl.data.year || 'Desconocido'

            let infoExtensa = `🔮 ━━━ 【 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖣𝖤 𝖠𝖴𝖣𝖨𝖮 𝖲𝖯𝖮𝖳𝖨𝖥𝖸 】 ━━━ 🔮\n\n`
            infoExtensa += `⬡ *𝖳𝖨𝖳𝖴𝖫𝖮:* ${nombreCancion}\n`
            infoExtensa += `⬡ *𝖠𝖱𝖳𝖨𝖲𝖳𝖠:* ${artista}\n`
            infoExtensa += `⬡ *𝖠𝖫𝖡𝖴𝖬:* ${album}\n`
            infoExtensa += `⬡ *𝖣𝖴𝖱A𝖢𝖨𝖮𝖭:* ${duracion}\n`
            infoExtensa += `⬡ *𝖠𝖭𝖮:* ${anio}\n\n`
            infoExtensa += `📊 ─── 【 𝖤𝖲𝖳A𝖣𝖨𝖲𝖳𝖨𝖢A𝖲 𝖣𝖤𝖫 𝖲𝖤𝖱𝖵𝖨𝖣𝖮𝖱 】 ───\n`
            infoExtensa += `⬡ *𝖭𝖮𝖣𝖮:* Enlace directo de inyección Spotify generado\n\n`
            infoExtensa += `🤝 ─── 【 𝖢𝖱𝖤𝖣𝖨𝖳𝖮𝖲 】 ───\n`
            infoExtensa += `⬡ *𝖢𝖱𝖤A𝖣𝖮𝖱:* ${dev}\n`
            infoExtensa += `⬡ *𝖲𝖮𝖯𝖮𝖱𝖳𝖤:* ${net}\n`
            infoExtensa += `👁️‍🗨️━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━👁️‍🗨️`

            await conn.sendMessage(m.chat, { 
                image: { url: caratula }, 
                caption: infoExtensa 
            }, { quoted: m })

            await conn.sendMessage(m.chat, { 
                audio: { url: streamUrl }, 
                mimetype: 'audio/mpeg',
                fileName: `${nombreCancion}.mp3`
            }, { quoted: m })

            await m.react('🔥')
        } else {
            await m.react('❌')
            return conn.reply(m.chat, `❌ El servidor central de Spotify no procesó la solicitud correctamente.`, m)
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
    }
}

handler.help = ['spotify']
handler.tags = ['downloader']
handler.command = /^(spotify|song|sp)$/i

export default handler
