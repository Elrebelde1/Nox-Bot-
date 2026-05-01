/**
 * Code: Flux AI Image AWS
 * Función: Generación de imágenes mediante el modelo Flux alojado en AWS 
 * para obtener resultados de alta calidad a partir de texto.
 * * Code creado por Barboza Developer
 * Se te agradece dejar los créditos.
 * Disfruta el código de Barboza Developer x Zona Developers.
 */

import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) return conn.reply(m.chat, `🌸 *Ejemplo:* ${usedPrefix}${command} un gato realista`, m)
  
  await m.react('🕓')

  try {
    const result = await fluximg.create(text)
    
    if (result && result.imageLink) {
      await m.react('✅')
      await conn.sendMessage(m.chat, {
          image: { url: result.imageLink },
          caption: `*\`Resultados De:\`* ${text}\n\n_Disfruta el código de Barboza Developer x Zona Developers._`,
        }, { quoted: m })
    } else {
      throw new Error("Sin enlace de imagen")
    }
  } catch (error) {
    console.error(error)
    await m.react('❌')
    conn.reply(m.chat, "⚠️ Error al crear la imagen. Intenta con un prompt más descriptivo.", m)
  }
}

handler.help = ["flux"]
handler.tags = ["ia"]
handler.command = ["flux"]

export default handler

const fluximg = {
  // Cambiado a 1:1 para mayor compatibilidad con el modelo
  defaultRatio: "1:1", 

  create: async (query) => {
    const config = {
      headers: {
        "accept": "*/*",
        "authority": "1yjs1yldj7.execute-api.us-east-1.amazonaws.com",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
      },
    }

    try {
      // Agregamos un timestamp para evitar respuestas cacheadas (que podrían ser la "pala")
      const response = await axios.get(
        `https://1yjs1yldj7.execute-api.us-east-1.amazonaws.com/default/ai_image?prompt=${encodeURIComponent(query)}&aspect_ratio=${fluximg.defaultRatio}&t=${Date.now()}`,
        config
      )
      
      return {
        imageLink: response.data.image_link || response.data.image || null,
      }
    } catch (error) {
      throw error
    }
  },
}
