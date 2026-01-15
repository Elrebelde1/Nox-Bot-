import fetch from 'node-fetch'
import axios from 'axios'

const handler = async (m, { conn, text, usedPrefix, command }) => {
  // Configuración de la API
  const API_KEY = "799343a24b120a1a5798fe780b823230"
  const API_BASE = "https://optishield.uk/api/"

  try {
    // Si no hay texto, mostrar ejemplo de uso
    if (!text) return conn.reply(m.chat, `💥 *Por favor, proporciona un enlace de YouTube.*\n\n📌 *Ejemplo:* \n${usedPrefix + command} https://youtu.be/dQw4w9WgXcQ`, m)
    
    await m.react('🕒')

    // Validar enlace de YouTube
    const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    const matchYT = text.match(ytRegex)
    if (!matchYT) throw '⚠ Enlace de YouTube no válido.'

    const videoUrl = `https://www.youtube.com/watch?v=${matchYT[1]}`

    // Llamada a la API de Optishield (usamos el URL como parámetro audio/query)
    // Nota: Aunque el parámetro dice 'audio', la API procesa el video para descarga
    const optishieldUrl = `${API_BASE}?type=mp3-mp4&apikey=${API_KEY}&audio=${encodeURIComponent(videoUrl)}`

    const res = await axios.get(optishieldUrl)
    const data = res.data

    // Extraer el enlace de descarga del JSON de respuesta usando el método Match (Regex)
    const matchDownload = JSON.stringify(data).match(/https:\/\/optishield\.uk\/tmp\/[^\s"]+/)

    if (!matchDownload) throw '👹 No se pudo obtener el video del servidor.'

    const downloadUrl = matchDownload[0]
    const title = "Video_Descargado" // La API a veces no devuelve el título limpio en el JSON, usamos uno genérico o el ID

    // Enviar el archivo MP4
    await conn.sendFile(m.chat, downloadUrl, `${title}.mp4`, `> 💀 *VIDEO DESCARGADO*\n> ✅ Fuente: Optishield API`, m)
    
    await m.react('✔️')

  } catch (e) {
    console.error(e)
    await m.react('✖️')
    conn.reply(m.chat, typeof e === 'string' ? e : '⚠ Ocurrió un error al procesar el video.', m)
  }
}

handler.command = handler.help = ['ytmp4']
handler.tags = ['descargas']
handler.group = false 

export default handler
