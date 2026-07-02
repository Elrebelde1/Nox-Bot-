import ytSearch from 'yt-search'

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('✨ *Nox Bot 🌃*\n¿Qué quieres buscar?')
    
    await m.react('🔍')
    
    try {
        let search = await ytSearch(text)
        let results = search.videos.slice(0, 5)
        
        if (!results.length) return m.reply('❌ No encontré resultados.')

        let txt = `*Nox Bot 🌃 - Buscador*\n`
        txt += `_Consultando: ${text}_\n\n`
        
        txt += results.map((v, i) => {
            return `*${i + 1}. ${v.title}*\n🕒 Duración: ${v.timestamp}\n🔗 ${v.url}`
        }).join('\n\n')

        await conn.reply(m.chat, txt, m)
        await m.react('✅')
        
    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('⚠️ *Error:* No se pudo realizar la búsqueda.')
    }
}

handler.help = ['google <busqueda>']
handler.tags = ['search']
handler.command = /^google$/i

export default handler
