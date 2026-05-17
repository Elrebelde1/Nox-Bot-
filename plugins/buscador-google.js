/**
 * 📂 COMANDO: google
 * 📝 DESCRIPCIÓN: Buscador de Google usando Scraper nativo (0 APIs y sin google-it).
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * ⚠️ IMPORTANTE: Funciona con cheerio/fetch nativo de la base. 
 * ¡Ahora los códigos son mejores!
 */

import fetch from 'node-fetch'
import * as cheerio from 'cheerio'

let handler = async (m, { text, usedPrefix }) => {
  if (!text) {
    return m.reply(`🔍 Por favor, dime qué deseas buscar en Google.\n\n📌 Ejemplo: ${usedPrefix}google Messi Inter Miami`)
  }

  try {
    await m.react('🔍')

    const url = `https://www.google.com/search?q=${encodeURIComponent(text.trim())}&hl=es`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
      }
    })
    
    const html = await response.text()
    const $ = cheerio.load(html)
    const results = []

    // Raspando los contenedores principales de Google
    $('.g').each((i, el) => {
      const title = $(el).find('h3').text()
      const link = $(el).find('a').attr('href')
      const snippet = $(el).find('.VwiC3b').text()

      if (title && link) {
        results.push({ title, link, snippet: snippet || 'Sin descripción disponible.' })
      }
    })

    if (results.length === 0) {
      await m.react('❌')
      return m.reply('😕 No se encontraron resultados para tu búsqueda.')
    }

    let reply = `🔎 *Resultados de búsqueda para:* ${text}\n\n`

    results.slice(0, 8).forEach((item, i) => {
      reply += `✨ *${i + 1}.* ${item.title}\n`
      reply += `📝 ${item.snippet}\n`
      reply += `🔗 ${item.link}\n\n`
    })

    reply += `━━━━━━━━━━━━━━━━━━━━\n`
    reply += `⚡ *By: Barboza Developer*\n`
    reply += `🌐 *Zona Developers*`

    await m.reply(reply.trim())
    await m.react('✅')

  } catch (err) {
    await m.react('❌')
    m.reply(`🚨 Ocurrió un error al realizar la búsqueda con el scraper nativo.`)
  }
}

handler.help = ['google']
handler.command = ['google']
handler.tags = ['internet']
handler.group = false

export default handler
