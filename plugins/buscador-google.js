/**
 * 📂 COMANDO: google
 * 📝 DESCRIPCIÓN: Buscador de Google/Web usando Scraper nativo estable (0 APIs y sin google-it).
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * ⚠️ IMPORTANTE: Funciona con cheerio/fetch nativo de la base. 
 * ¡Ahora los códigos son mejores!
 */

import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

let handler = async (m, { text, usedPrefix }) => {
  if (!text) {
    return m.reply(`🏮 *¡Falta la consulta!* Por favor, escribe lo que deseas buscar.\n\n💡 *Ejemplo:* ${usedPrefix}google Inteligencia Artificial`)
  }

  try {
    await m.react('⏳')

    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(text.trim())}&kl=es-es`
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'es-ES,es;q=0.9'
      }
    })

    const html = await response.text()
    const $ = cheerio.load(html)
    const results = []

    $('.result').each((i, el) => {
      const titleObj = $(el).find('.result__a')
      const title = titleObj.text().trim()
      const rawLink = titleObj.attr('href')
      const snippet = $(el).find('.result__snippet').text().trim()

      if (title && rawLink) {
        let finalLink = rawLink
        if (rawLink.includes('uddg=')) {
          let parts = rawLink.split('uddg=')[1]
          if (parts) {
            finalLink = decodeURIComponent(parts.split('&')[0].split('&amp;')[0])
          }
        }
        results.push({ title, link: finalLink, snippet })
      }
    })

    if (results.length === 0) {
      await m.react('❌')
      return m.reply('❌ *No se hallaron coincidencias en la web para tu búsqueda.*')
    }

    const topResults = results.slice(0, 3)
    let contextText = topResults.map((r, idx) => `[Fuente ${idx + 1}]: ${r.title} - ${r.snippet}`).join('\n')

    let aiDefinition = "No se pudo generar una definición inteligente."
    try {
      const apiKey = "sylphy-6f150d"
      const promptIA = `Actúa como un buscador inteligente. Basándote ÚNICAMENTE en la siguiente información recopilada de la web, redacta una respuesta clara, directa, profesional y detallada en español que responda a la duda del usuario: "${text.trim()}".\n\nInformación de la web:\n${contextText}`
      
      const aiUrl = `https://sylphyy.xyz/ai/copilot?text=${encodeURIComponent(promptIA)}&api_key=${apiKey}`
      const aiRes = await fetch(aiUrl)
      const aiData = await aiRes.json()

      if (aiData.status && aiData.result && aiData.result.text) {
        aiDefinition = aiData.result.text.trim()
      }
    } catch (aiErr) {
      console.error(aiErr)
      aiDefinition = "⚠️ _La IA no pudo procesar un resumen, pero aquí tienes los enlaces directos de la búsqueda:_"
    }

    let ui = `⛩️ ──── [ *GOOGLE SEARCH & IA* ] ──── ⛩️\n`
    ui += `🔍 *Búsqueda:* ${text.trim()}\n`
    ui += `╰───────────────────────────────\n\n`
    
    ui += `📝 *DEFINICIÓN INTELIGENTE:*\n${aiDefinition}\n\n`
    
    ui += `⚡ *FUENTES Y ENLACES RELACIONADOS:*\n`
    results.slice(0, 5).forEach((item, i) => {
      ui += `🏮 *[ 0${i + 1} ]* ── *${item.title.toUpperCase()}*\n`
      ui += `🔗 *Enlace:* ${item.link}\n\n`
    })

    ui += `╭───────────────────────────────\n`
    ui += `│ ⚡ *By: Barboza Developer*\n`
    ui += `│ 🏮 *Zona Developers*\n`
    ui += `╰───────────────────────────────`

    await m.reply(ui.trim())
    await m.react('✅')

  } catch (err) {
    console.error(err)
    await m.react('❌')
    m.reply(`⚠️ *Ocurrió un fallo en el sistema al procesar el scraper o la IA.*`)
  }
}

handler.help = ['google']
handler.command = ['google']
handler.tags = ['internet']
handler.group = false

export default handler
