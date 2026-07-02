let handler = async (m, { conn, text }) => {
    if (!text) throw 'Ingresa un enlace de Mediafire'
    try {
        let res = await (await fetch(`https://api.evogb.org/dl/mediafire?url=${text}&key=sasuke`)).json()
        let info = res.data
        
        let txt = `*MEDIAFIRE DOWNLOADER*\n\n` +
                  `📄 Archivo: ${info.name}\n` +
                  `⚖️ Tamaño: ${info.size}\n` +
                  `🕒 Fecha: ${info.date}\n` +
                  `⬇️ Descarga: ${info.dl}`
                  
        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    } catch (e) {
        throw 'Error al obtener el archivo, verifica el enlace.'
    }
}
handler.help = ['mediafire <link>']
handler.tags = ['downloader']
handler.command = /^(mediafire)$/i
export default handler
