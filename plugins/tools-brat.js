import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'

var handler = async (m, { conn, usedPrefix, command, text }) => {
    // Separamos el texto y el color mediante el pipe "|"
    let [txt, color] = text.split('|')
    let textoFinal = txt ? txt.trim() : (m.quoted?.text || null)

    if (!textoFinal) return conn.reply(m.chat, '⚡ *Escribe el texto para tu sticker brat*\n> Ejemplo: .brat Sasuke Bot', m)

    // Validación de longitud para evitar errores de renderizado
    if (textoFinal.length > 35) {
        return conn.reply(m.chat, `⚠️ *Texto muy largo.*\n\n📌 Máximo: *35 letras*`, m)
    }

    // Mapeo de nombres de colores a valores aceptados por la API (Inglés/Español)
    const colorMap = {
        "blanco": "Blanco",
        "verde": "Verde",
        "rojo": "Rojo",
        "azul": "Azul",
        "amarillo": "Amarillo",
        "rosa": "Rosa",
        "cian": "Cian",
        "naranja": "Naranja",
        "morado": "Morado",
        "negro": "Negro"
    }

    // Si no se especifica color, mostramos el menú de botones
    if (!color) {
        const botones = Object.keys(colorMap).filter(c => c !== 'negro').map(c => ({
            buttonId: `${usedPrefix + command} ${textoFinal}|${c}`,
            buttonText: { displayText: c.charAt(0).toUpperCase() + c.slice(1) },
            type: 1
        }))

        const buttonMessage = {
            text: `👤 *𝖲𝖺𝗌𝗎𝗄𝖾 𝖡𝗈𝗍 𝖬𝖣 — 𝖡𝗋𝖺𝗍 𝢢𝗈𝗅𝗈𝗋*\n\n📝 *Texto:* ${textoFinal}\n\n*Seleccione el color de fondo:*`,
            footer: "𝖡by 𝖡𝖺𝗋𝖻𝗈𝗓𝖺-𝖳𝖾𝖺𝗆 ⚡",
            buttons: botones,
            headerType: 1
        }
        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
    }

    let { key } = await conn.sendMessage(m.chat, { text: '⏳ *Generando sticker estilo Brat...*' }, { quoted: m })

    try {
        await m.react('🕒')

        // Configuración de la nueva API
        const apiKey = "sylphy-6f150d"
        const selectedColor = colorMap[color.trim().toLowerCase()] || "Blanco"
        
        // La API parece requerir fondo para el color y el texto en un formato específico
        // Según tu URL: text=...&color=Negro&fondo=Blanco
        const apiUrl = `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(textoFinal)}&color=Negro&fondo=${selectedColor}&type=Nose&api_key=${apiKey}`

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })

        const img = `./tmp-${Date.now()}.png`
        const webp = `./tmp-${Date.now()}.webp`
        fs.writeFileSync(img, response.data)

        // Conversión FFmpeg a WebP (Sticker)
        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${img} -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ${webp}`, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        // Envío del sticker con créditos
        await conn.sendMessage(m.chat, { 
            sticker: fs.readFileSync(webp), 
            packname: "𝖲𝖺𝗌𝗎𝗄𝖾 𝖡𝗈𝗍 𝖬𝖣 👤", 
            author: "𝖡𝗒 𝖡𝖺𝗋𝖻𝗈𝗓𝖺-𝖳𝖾𝖺𝗆 ⚡" 
        }, { quoted: m })

        await conn.sendMessage(m.chat, { text: '✅ *¡Sticker creado con éxito!*', edit: key })
        await m.react('✔️')

        // Limpieza de archivos temporales
        if (fs.existsSync(img)) fs.unlinkSync(img)
        if (fs.existsSync(webp)) fs.unlinkSync(webp)

    } catch (e) {
        console.error(e)
        await m.react('✖️')
        await conn.sendMessage(m.chat, { text: '❌ *Error al conectar con la API de Sylphyy.*', edit: key })
    }
}

handler.help = ['brat']
handler.tags = ['sticker']
handler.command = /^(brat|bratcolor)$/i

export default handler
