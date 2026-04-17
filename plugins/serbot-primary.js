import axios from 'axios'
import { exec } from 'child_process'
import fs from 'fs'
import { join } from 'path'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let q = m.quoted ? m.quoted.text : text
    if (!q) return m.reply(`⚠️ Escribe un texto.\n\n> Ejemplo: *${usedPrefix + command}* Hola gey`)

    await m.react('⏳')

    try {
        const url = `https://yosoyyo-api-ofc.onrender.com/api/tts?text=${encodeURIComponent(q)}&apiKey=yosoyyo_sk_cq1h5ccx`
        
        // Obtenemos los bytes del audio
        const res = await axios.get(url, { responseType: 'arraybuffer' })
        
        const tempWav = join(process.cwd(), `temp_${Date.now()}.wav`)
        const tempOpus = join(process.cwd(), `temp_${Date.now()}.opus`)

        // Guardamos el WAV temporalmente
        fs.writeFileSync(tempWav, res.data)

        // Convertimos a OPUS (formato nativo de notas de voz de WhatsApp)
        exec(`ffmpeg -i ${tempWav} -c:a libopus -b:a 128k ${tempOpus}`, async (err) => {
            if (err) {
                console.error(err)
                return m.reply('❌ Error al convertir el audio.')
            }

            await conn.sendMessage(m.chat, { 
                audio: fs.readFileSync(tempOpus), 
                mimetype: 'audio/ogg; codecs=opus', 
                ptt: true 
            }, { quoted: m })

            // Borramos archivos temporales
            if (fs.existsSync(tempWav)) fs.unlinkSync(tempWav)
            if (fs.existsSync(tempOpus)) fs.unlinkSync(tempOpus)
            
            await m.react('✅')
        })

    } catch (e) {
        console.error(e)
        m.reply('❌ Fallo al procesar la API.')
    }
}

handler.help = ['voz <texto>']
handler.tags = ['tools']
handler.command = /^voz|decir$/i

export default handler
