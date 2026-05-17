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
    return m.reply(`⚠️ *¡Falta la consulta!* Por favor, escribe lo que deseas buscar.\n\n💡 *Ejemplo:* ${usedPrefix}google Inteligencia Artificial`)
  }

  try {
    await m.react('⚡')

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
        
        results.push({ 
          title, 
          link: finalLink, 
          snippet: snippet || 'Sin resumen disponible para este sitio web.' 
        })
      }
    })

    if (results.length === 0) {
      await m.react('❌')
      return m.reply('❌ *No se hallaron coincidencias para tu búsqueda.*')
    }

    let ui = `╭🌐 ──── [ *GOOGLE SEARCH* ] ──── 🌐\n`
    ui += `│ 🔍 *Búsqueda:* ${text.trim()}\n`
    ui += `╰───────────────────────────\n\n`

    results.slice(0, 5).forEach((item, i) => {
      ui += `🔷 *[ 0${i + 1} ]* ── *${item.title.toUpperCase()}*\n`
      ui += `📝 *Resumen:* _${item.snippet}_\n`
      ui += `🔗 *Enlace:* ${item.link}\n\n`
    })

    ui += `╭───────────────────────────\n`
    ui += `│ ⚡ *By: Barboza Developer*\n`
    ui += `│ 🌐 *Zona Developers*\n`
    ui += `╰───────────────────────────`

    await m.reply(ui.trim())
    await m.react('✅')

  } catch (err) {
    await m.react('❌')
    m.reply(`⚠️ *Ocurrió un fallo en el sistema al procesar el scraper.*`)
  }
}

handler.help = ['google']
handler.command = ['google']
handler.tags = ['internet']
handler.group = false

export default handler
