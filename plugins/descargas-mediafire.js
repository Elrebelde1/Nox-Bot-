let handler = async (m, { conn, text }) => {
    if (!text) return m.reply('Ingresa un enlace de Mediafire')
    
    let res = await fetch(`https://api.evogb.org/dl/mediafire?url=${text}&key=sasuke`)
    let json = await res.json()
    
    if (!json.status) return m.reply('*Error al obtener el archivo, verifica el enlace.*')
    
    let { name, size, date, dl } = json.data
    
    let caption = `*MEDIAFIRE DOWNLOADER*\n\n` +
                  `📄 Archivo: ${name}\n` +
                  `⚖️ Tamaño: ${size}\n` +
                  `🕒 Fecha: ${date}`
                  
    await conn.sendFile(m.chat, dl, name, caption, m)
}

handler.help = ['mediafire <link>']
handler.tags = ['downloader']
handler.command = /^(mediafire)$/i

export default handler
