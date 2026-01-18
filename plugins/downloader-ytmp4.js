import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `💥 *Por favor, proporciona un enlace de YouTube.*\n\n📌 *Ejemplo:* \n${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ`, m)

  try {
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    const matchYT = text.match(ytRegex)
    if (!matchYT) throw '⚠ El enlace proporcionado no es válido.'

    const videoUrl = `https://www.youtube.com/watch?v=${matchYT[1]}`
    await m.react('🕒')

    // Configuración de la API
    const quality = '360p' // Cambia a 480p o 720p si deseas más resolución
    const apiKey = 'sylphy-6f150d'
    const apiUrl = `https://sylphy.xyz/download/ytmp4?url=${encodeURIComponent(videoUrl)}&q=${quality}&api_key=${apiKey}`

    const res = await axios.get(apiUrl)
    const json = res.data

    if (json.status === false) throw `👹 Error de API: ${json.error}`

    const downloadUrl = json.result?.url || json.url
    const title = json.result?.title || 'Video_descargado'

    await conn.sendFile(m.chat, downloadUrl, `${title}.mp4`, `🎬 *TÍTULO:* ${title}\n⚙️ *CALIDAD:* ${quality}\n\n> ✅ Descargado vía Sylphy API`, m)
    await m.react('✔️')

  } catch (e) {
    console.error(e)
    await m.react('✖️')
    conn.reply(m.chat, `❌ *ERROR:* ${typeof e === 'string' ? e : 'No se pudo procesar la descarga.'}`, m)
  }
}

handler.help = ['ytmp4']
handler.tags = ['descargas']
handler.command = ['ytmp4', 'ytv'] 

export default handler
