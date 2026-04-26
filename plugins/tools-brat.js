import axios from 'axios'
import fs from 'fs'
import { exec } from 'child_process'

var handler = async (m, { conn, usedPrefix, command, text }) => {
    // Separamos por el pipe "|"
    let [txt, colorRaw] = text.split('|')
    let textoFinal = txt ? txt.trim() : (m.quoted?.text || null)

    if (!textoFinal) return conn.reply(m.chat, '✨ *Escribe el texto para tu sticker*\n> Ejemplo: .brat Sasuke Bot', m)

    // Diccionario para limpiar emojis y asegurar que la API reciba el nombre puro en inglés o español según soporte
    const colorMap = {
        "blanco": "Blanco", "verde": "Verde", "rojo": "Rojo", 
        "azul": "Azul", "amarillo": "Amarillo", "rosa": "Rosa", 
        "cian": "Cian", "naranja": "Naranja", "morado": "Morado"
    }

    // Si no hay color seleccionado, mostrar botones
    if (!colorRaw) {
        const botones = [
            { buttonId: `${usedPrefix + command} ${textoFinal}|blanco`, buttonText: { displayText: "Blanco 🤍" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|verde`, buttonText: { displayText: "Verde 💚" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|rojo`, buttonText: { displayText: "Rojo ❤️" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|azul`, buttonText: { displayText: "Azul 💙" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|amarillo`, buttonText: { displayText: "Amarillo 💛" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|rosa`, buttonText: { displayText: "Rosa 🩷" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|cian`, buttonText: { displayText: "Cian 🩵" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|naranja`, buttonText: { displayText: "Naranja 🧡" }, type: 1 },
            { buttonId: `${usedPrefix + command} ${textoFinal}|morado`, buttonText: { displayText: "Morado 💜" }, type: 1 }
        ]

        return await conn.sendMessage(m.chat, {
            text: `👤 *𝖲𝖺𝗌𝗎𝗄𝖾 𝖡𝗈𝗍 𝖬𝖣 — 𝖡𝗋𝖺𝗍 𝖢𝗈𝗅𝗈𝗋*\n\n📝 *Texto:* ${textoFinal}\n\n*Selecciona un color:*`,
            footer: "𝖡𝗒 𝖡𝖺𝗋𝖻𝗈𝗓𝖺-𝖳𝖾𝖺𝗆 ⚡",
            buttons: botones,
            headerType: 1
        }, { quoted: m })
    }

    let { key } = await conn.sendMessage(m.chat, { text: '⏳ *Procesando color...*' }, { quoted: m })

    try {
        await m.react('🕒')

        // LIMPIEZA CRUCIAL: Quitamos emojis y espacios extra
        const colorLimpio = colorRaw.replace(/[^\w]/g, '').toLowerCase()
        const fondoFinal = colorMap[colorLimpio] || "Blanco"

        const apiKey = "sylphy-6f150d"
        // Forzamos la URL con el color ya validado
        const apiUrl = `https://sylphyy.xyz/tools/brat?text=${encodeURIComponent(textoFinal)}&color=Negro&fondo=${fondoFinal}&type=Nose&api_key=${apiKey}`

        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' })
        const img = `./tmp-${Date.now()}.png`
        const webp = `./tmp-${Date.now()}.webp`
        fs.writeFileSync(img, response.data)

        // Filtro de brillo y saturación para que resalte
        const shadowFilter = `eq=brightness=0.05:saturation=1.5:contrast=1.2,unsharp=5:5:1.0:5:5:0.0`

        await new Promise((resolve, reject) => {
            exec(`ffmpeg -i ${img} -vf "${shadowFilter},scale=512:512:force_original_aspect_ratio=decrease,format=rgba,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=#00000000" ${webp}`, (err) => {
                if (err) reject(err)
                else resolve()
            })
        })

        await conn.sendMessage(m.chat, { 
            sticker: fs.readFileSync(webp), 
            packname: "𝖲𝖺𝗌𝗎𝗄𝖾 𝖡𝗈𝗍 𝖬𝖣 👤", 
            author: `𝖡𝗋𝖺𝗍 ${fondoFinal} ✨` 
        }, { quoted: m })

        await conn.sendMessage(m.chat, { text: `✅ *¡Sticker ${fondoFinal} generado!*`, edit: key })
        await m.react('✔️')

        if (fs.existsSync(img)) fs.unlinkSync(img)
        if (fs.existsSync(webp)) fs.unlinkSync(webp)

    } catch (e) {
        console.error(e)
        await conn.sendMessage(m.chat, { text: '❌ *Error en el servidor de imagen.*', edit: key })
    }
}

handler.help = ['brat']
handler.tags = ['sticker']
handler.command = /^(brat|bratcolor)$/i

export default handler
