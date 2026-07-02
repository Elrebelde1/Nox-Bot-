import { search } from 'duck-duck-scrape'

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('✨ *Nox Bot 🌃*\nIngresa un término para buscar.')
    
    await m.react('🔍')
    
    try {
        // Buscamos directamente sin APIs externas
        const results = await search(text, { safeSearch: 'moderate' })
        
        if (!results.results || results.results.length === 0) {
            return m.reply('❌ No se encontraron resultados.')
        }

        let txt = `*Nox Bot 🌃 - Buscador Web*\n`
        txt += `_Resultados para: ${text}_\n\n`
        
        // Tomamos los primeros 5 resultados
        txt += results.results.slice(0, 5).map((v, i) => {
            return `*${i + 1}. ${v.title}*\n${v.description}\n🔗 ${v.url}`
        }).join('\n\n')

        await conn.reply(m.chat, txt, m)
        await m.react('✅')
        
    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('⚠️ *Error:* No pude realizar la búsqueda.')
    }
}

handler.help = ['google <busqueda>']
handler.tags = ['search']
handler.command = /^google$/i

export default handler
