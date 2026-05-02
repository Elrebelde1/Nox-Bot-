import fetch from 'node-fetch'
import uploadImage from '../lib/uploadImage.js'

const handler = async (m, { conn, text }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''
    let url

    m.react('🕒')

    try {
        if (/image/.test(mime)) {
            let img = await q.download()
            url = await uploadImage(img)
        } else if (text && text.startsWith('http')) {
            url = text
        } else {
            m.react('✖️')
            throw `Responda a una imagen o proporcione una URL.`
        }

        let api = `https://api.evogb.org/tools/removebg?method=url&url=${encodeURIComponent(url)}&key=Jotaa.hrzkey`
        let response = await fetch(api)
        
        if (!response.ok) throw new Error('API Error')

        const buffer = await response.arrayBuffer()
        m.react('☑️')
        
        await conn.sendMessage(m.chat, { 
            image: Buffer.from(buffer) 
        }, { quoted: m })

    } catch (error) {
        m.react('✖️')
        throw `Error: ${error.message}`
    }
}

handler.tags = ['tools']
handler.help = ['removebg']
handler.command = ['removebg', 'bg']

export default handler
