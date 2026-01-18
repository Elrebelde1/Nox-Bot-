import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `💥 *Por favor, proporciona un enlace de YouTube.*\n\n📌 *Ejemplo:* \n${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ`, m)

  try {
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    const matchYT = text.match(ytRegex)
    if (!matchYT) throw '⚠ El enlace proporcionado no es válido.'

    const videoId = matchYT[1]
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    await m.react('🕒')

    // Configuración de la API
    const quality = '360' // Algunas APIs prefieren solo el número
    const apiKey = 'sylphy-6f150d'
    const apiUrl = `https://sylphy.xyz/download/ytmp4?url=${encodeURIComponent(videoUrl)}&q=${quality}&api_key=${apiKey}`

    const res = await axios.get(apiUrl)
    const json = res.data

    if (!json.status) throw `👹 Error de API: ${json.error || 'No se pudo obtener el enlace'}`

    const downloadUrl = json.result?.url || json.url
    const title = json.result?.title || 'Video'

    // Cambiamos sendFile para asegurar que se envíe como video
    await conn.sendMessage(m.chat, { 
        video: { url: downloadUrl }, 
        caption: `🎬 *TÍTULO:* ${title}\n⚙️ *CALIDAD:* ${quality}p\n\n> ✅ Descargado vía Sylphy API`,
        fileName: `${title}.mp4`,
        mimetype: 'video/mp4'
    }, { quoted: m })

    await m.react('✔️')

  } catch (e) {
    console.error(e)
    await m.react('✖️')
    // Manejo de error si el archivo es demasiado grande para WhatsApp (usualmente > 16MB o 40MB según el bot)
    conn.reply(m.chat, `❌ *ERROR:* Puede que el video sea muy pesado o la API esté caída.\n\n${e}`, m)
  }
}

handler.help = ['ytmp4']
handler.tags = ['descargas']
handler.command = ['ytmp4', 'ytv'] 

export default handler
