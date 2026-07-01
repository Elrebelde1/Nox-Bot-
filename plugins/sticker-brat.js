import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'

const handler = async (m, { conn, text }) => {
    let texto = text || m.quoted?.text
    if (!texto) return m.reply('Escribe el texto.')

    await m.react('🕒')

    let tmpImg = `./tmp-${Date.now()}.png`
    let tmpWebp = `./tmp-${Date.now()}.webp`

    try {
        let endpoint = `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(texto)}&color=white&fondo=green&type=&api_key=sylphy-6f150d`
        let response = await axios.get(endpoint, { responseType: 'arraybuffer' })
        fs.writeFileSync(tmpImg, response.data)

        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${tmpImg} -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ${tmpWebp}`, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        await conn.sendMessage(m.chat, { 
            sticker: fs.readFileSync(tmpWebp), 
            packname: "Sasuke Bot", 
            author: "Sebastián Barboza" 
        }, { quoted: m })

        await m.react('🔥')
    } catch (e) {
        await m.react('❌')
    } finally {
        if (fs.existsSync(tmpImg)) fs.unlinkSync(tmpImg)
        if (fs.existsSync(tmpWebp)) fs.unlinkSync(tmpWebp)
    }
}

handler.help = ['brat']
handler.tags = ['sticker']
handler.command = ['brat']

export default handler
