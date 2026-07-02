let handler = async (m, { conn, text }) => {
    if (!text) throw 'Ingresa un enlace de Mediafire'
    try {
        let res = await (await fetch(`https://api.evogb.org/dl/mediafire?url=${text}&key=sasuke`)).json()
        let data = res.data
        let txt = `*Archivo:* ${data.name}\n*Tamaño:* ${data.size}\n*Link:* ${data.dl}`
        await conn.sendMessage(m.chat, { text: txt }, { quoted: m })
    } catch (e) {
        throw 'Error en la API'
    }
}
handler.help = ['mediafire <link>']
handler.tags = ['downloader']
handler.command = /^(mediafire)$/i
export default handler
