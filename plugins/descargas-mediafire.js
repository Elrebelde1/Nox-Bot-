
let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Ingresa un enlace de Mediafire')
    
    try {
        let res = await (await fetch(`https://api.evogb.org/dl/mediafire?url=${text}&key=sasuke`)).json()
        
        if (!res.status || !res.data) {
            return m.reply('*Error al obtener el archivo, verifica el enlace.*')
        }
        
        let info = res.data
        let txt = `*MEDIAFIRE DOWNLOADER*\n\n` +
                  `📄 Archivo: ${info.name}\n` +
                  `⚖️ Tamaño: ${info.size}\n` +
                  `🕒 Fecha: ${info.date}`
                  
        await conn.sendFile(m.chat, info.dl, info.name, txt, m)
        
    } catch (e) {
        // Aquí solo responde si hay un error real de ejecución (ej. API caída)
        m.reply('*Error al obtener el archivo, verifica el enlace.*')
    }
}
handler.help = ['mediafire <link>']
handler.tags = ['downloader']
handler.command = /^(mediafire)$/i
export default handler
