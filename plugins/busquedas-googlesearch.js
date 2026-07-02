import google from 'google-it'

let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('✨ ¿Qué deseas buscar en Google?')
    await m.react('🔍')
    
    try {
        // Configuramos la búsqueda
        let results = await google({ query: text, limit: 5 })
        
        if (!results || results.length === 0) {
            await m.react('❌')
            return m.reply('❌ No encontré resultados para esa búsqueda.')
        }

        let txt = `*Nox Bot 🌃 - Resultados de Google*\n\n`
        txt += results.map((v, i) => {
            return `*${i + 1}. ${v.title}*\n_${v.snippet}_\n🔗 ${v.link}`
        }).join('\n\n')

        await conn.reply(m.chat, txt, m)
        await m.react('✅')
        
    } catch (e) {
        console.error(e)
        await m.react('❌')
        m.reply('❌ Hubo un error al conectar con Google.')
    }
}

handler.help = ['google <busqueda>']
handler.tags = ['search']
handler.command = /^google$/i

export default handler
