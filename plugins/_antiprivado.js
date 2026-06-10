/**
 * 📂 COMANDO: Uchiha Google Image (Álbum)
 * 📝 DESCRIPCIÓN: Buscador de imágenes de Google que envía los resultados juntos.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const dev = "𝘽𝙮 𝘽𝙖𝙧𝙗𝙤𝙯𝙖"
    const chn = "𝙕𝙤𝙣𝙖 𝘿𝙚𝙫𝙚𝙡𝙤𝙥𝙚𝙧𝙨"

    if (!text) return conn.reply(m.chat, `*🔍 ¿Qué imágenes deseas buscar?*\n*Ejemplo:* ${usedPrefix + command} Messi`, m)

    if (m.react) await m.react('🔍')

    try {
        let res = await fetch(`https://api.evogb.org/search/googleimage?query=${encodeURIComponent(text)}&key=sasuke`)
        let json = await res.json()

        if (!json.status || !json.result || json.result.length === 0) {
            if (m.react) await m.react('❌')
            return conn.reply(m.chat, '🛑 No encontré imágenes.', m)
        }

        // Seleccionamos 5 imágenes al azar
        let results = json.result.sort(() => 0.5 - Math.random()).slice(0, 5)
        
        // Creamos el array con el formato de imágenes para el álbum
        let album = []
        for (let data of results) {
            album.push({
                image: { url: data.image },
                caption: `📌 *𝚃𝙸𝚃𝚄𝙻𝙾:* ${data.title}`
            })
        }

        // Texto principal que acompañará al grupo de imágenes
        let mainCaption = `「 🖼️ 𝚄𝙲𝙷𝙸𝙷𝙰 𝙸𝙼𝙰𝙶𝙴𝚂 」\n`
        mainCaption += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n`
        mainCaption += `🔍 *𝙱𝚄𝚂𝚀𝚄𝙴𝙳𝙰:* ${text.toUpperCase()}\n`
        mainCaption += `─── 🕒 ☆ : .☽ . : ☆ 🕒 ───\n\n`
        mainCaption += `⚡ *Code creado por ${dev}*\n`
        mainCaption += `📡 *Disfruta el código de ${dev} x ${chn}*`

        // Enviamos el álbum completo
        // Nota: Si tu base de bot no soporta 'conn.sendAlbum', puedes usar 'conn.sendMessage(m.chat, { text: mainCaption }, { quoted: m })' antes y luego el array.
        if (conn.sendAlbum) {
            await conn.sendAlbum(m.chat, album, { 
                caption: mainCaption, 
                quoted: m 
            })
        } else {
            // Alternativa nativa de Baileys si no tienes la función simplificada instalada:
            for (let i = 0; i < album.length; i++) {
                await conn.sendMessage(m.chat, { 
                    image: album[i].image, 
                    caption: i === 0 ? mainCaption + `\n\n${album[i].caption}` : album[i].caption 
                }, { quoted: m })
            }
        }

        if (m.react) await m.react('✅')

    } catch (error) {
        console.error(error)
        if (m.react) await m.react('❌')
        conn.reply(m.chat, '⚠️ Error en el servidor al procesar las imágenes.', m)
    }
}

handler.help = ['imagen <texto>']
handler.tags = ['internet']
handler.command = /^(googleimage2|img2|imagen|foto)$/i

export default handler
