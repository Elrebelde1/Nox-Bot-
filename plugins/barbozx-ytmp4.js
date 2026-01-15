import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  // Verificamos si se proporcionó un texto (URL)
  if (!text) return conn.reply(m.chat, `💥 *Por favor, proporciona un enlace de YouTube.*\n\n📌 *Ejemplo:* \n${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ`, m)

  try {
    // Validar que sea un enlace de YouTube
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    const matchYT = text.match(ytRegex)
    if (!matchYT) throw '⚠ El enlace proporcionado no es un video de YouTube válido.'

    const videoId = matchYT[1]
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    await m.react('🕒')

    // Llamada a la nueva API de Ultraplus
    // Endpoint: https://api-nexy.ultraplus.click/api/dl/ytmp4?url=
    const apiUrl = `https://api-nexy.ultraplus.click/api/dl/ytmp4?url=${encodeURIComponent(videoUrl)}`
    
    const res = await axios.get(apiUrl)
    const json = res.data

    // Verificamos si la API respondió con éxito
    // Nota: Ajustamos según la estructura común de estas APIs (status: true o result)
    if (!json || json.status === 400) throw '👹 El servidor no pudo procesar este video en este momento.'

    // Extraemos los datos (Ajusta 'url' o 'result' según lo que responda tu API)
    const downloadUrl = json.result?.url || json.url || json.download
    const title = json.result?.title || json.title || 'video_youtube'

    if (!downloadUrl) throw '⚠ No se encontró el enlace de descarga en la respuesta.'

    // Enviar el video MP4 al chat
    await conn.sendFile(m.chat, downloadUrl, `${title}.mp4`, `🎬 *TITULO:* ${title}\n> ✅ Descargado vía Ultraplus API`, m)

    await m.react('✔️')

  } catch (e) {
    console.error(e)
    await m.react('✖️')
    conn.reply(m.chat, `❌ *ERROR:* ${typeof e === 'string' ? e : 'No se pudo descargar el video.'}`, m)
  }
}

handler.help = ['ytmp4']
handler.tags = ['descargas']
handler.command = ['ytmp4', 'ytv'] // Comandos: .ytmp4 o .ytv

export default handler
