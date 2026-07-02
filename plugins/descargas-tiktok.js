let handler = async (m, { conn, text, command }) => {
    if (!text) throw 'Ingresa qué quieres buscar'
    try {
        if (command === 'tiktoksearch') {
            let res = await (await fetch(`https://api.evogb.org/search/tiktok?query=${text}&key=sasuke`)).json()
            let video = res.data[0]
            let caption = `*Título:* ${video.title}\n*Autor:* ${video.author.nickname}`
            await conn.sendFile(m.chat, video.dl, 'tiktok.mp4', caption, m)
        } else if (command === 'tiktok') {
            let res = await (await fetch(`https://api.evogb.org/dl/tiktok?url=${text}&key=sasuke`)).json()
            let data = res.data
            await conn.sendFile(m.chat, Array.isArray(data.dl) ? data.dl[0] : data.dl, 'tiktok.mp4', data.title, m)
        }
    } catch (e) {
        throw 'Error al obtener el video'
    }
}
handler.help = ['tiktok <link>', 'tiktoksearch <busqueda>']
handler.tags = ['downloader', 'search']
handler.command = /^(tiktok|tiktoksearch)$/i
export default handler
