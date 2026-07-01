import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return m.reply(`🛸 *[ BOX BOT MD ]* 🌌\n\n🚩 *Escribe el nombre de la canción a buscar.*\n📌 Ejemplo: *${usedPrefix + command} Lupita*`)

  await m.react('🔍')

  try {
    let searchRes = await fetch(`https://api.evogb.org/search/spotify?query=${encodeURIComponent(text)}&key=sasuke`)
    let searchData = await searchRes.json()
    
    if (!searchData.status || !searchData.result[0]) {
        await m.react('❌')
        return m.reply(`⚠️ *No se encontraron resultados para:* ${text}`)
    }

    await m.react('⏳')

    let song = searchData.result[0]
    let dlRes = await fetch(`https://api.evogb.org/dl/spotify?url=${encodeURIComponent(song.link)}&key=sasuke`)
    let dlData = await dlRes.json()
    
    if (!dlData.status) {
        await m.react('❌')
        return m.reply(`❌ *Error al obtener el enlace de descarga.*`)
    }

    let cap = `🛸 *[ BOX BOT MD ]* 🌌\n\n`
    cap += `🎶 *Título:* ${dlData.data.name}\n`
    cap += `👤 *Artista:* ${dlData.data.artist}\n`
    cap += `💿 *Álbum:* ${dlData.data.album}\n`
    cap += `⏳ *Duración:* ${dlData.data.duration}\n`
    cap += `📅 *Año:* ${dlData.data.year}\n\n`
    cap += `⚙️ *Box Bot MD • Enviando...* 🌀`

    await conn.sendMessage(m.chat, { image: { url: dlData.data.image }, caption: cap }, { quoted: m })
    await conn.sendMessage(m.chat, { audio: { url: dlData.data.url }, mimetype: 'audio/mpeg' }, { quoted: m })
    
    await m.react('✅')
  } catch (e) {
    await m.react('❌')
    m.reply(`⚠️ *Ocurrió un error inesperado:* ${e.message}`)
  }
}

handler.help = ['spotify <búsqueda>']
handler.tags = ['downloader']
handler.command = /^(spotify)$/i

export default handler
