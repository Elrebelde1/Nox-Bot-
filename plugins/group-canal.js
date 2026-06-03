/**
 * 📂 COMANDO: Uchiha Brat Generator (Session Code)
 * 📝 DESCRIPCIÓN: Genera stickers estilo Brat (estáticos o animados) procesando la API con Key oculta.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let contenidoTexto = text || (m.quoted && m.quoted.text ? m.quoted.text : '')

    if (!contenidoTexto) {
        let menuAlerta = `☠️ ═══ 〖 𝖡𝖱𝖠𝖳 𝖲𝖳𝖨𝖢𝖪𝖤𝖱 𝖦𝖤𝖭𝖤𝖱A𝖳𝖮𝖱 〗 ═══ ☠️\n\n`
        menuAlerta += `☣️ *ESTADO:* Nodo esperando cadena de texto...\n`
        menuAlerta += `⚠️ *REQUISITO:* Por favor introduce el texto para renderizar el sticker.\n\n`
        menuAlerta += `📌 *EJEMPLO DE USO COMPLETO:* \n`
        menuAlerta += `> ${usedPrefix + command} Sasuke Uchiha\n`
        menuAlerta += `■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■`
        return conn.reply(m.chat, menuAlerta, m)
    }

    await m.react('🟢')

    try {
        const apiBrat = "https://api.evogb.org/tools/brat"
        const claveOculta = Buffer.from("c2FzdWtl", 'base64').toString('utf-8')
        const esAnimado = /animado|gif/i.test(command) ? 'true' : 'false'
        
        const enlaceFinal = `${apiBrat}?text=${encodeURIComponent(contenidoTexto)}&animated=${esAnimado}&key=${claveOculta}`

        let response = await fetch(enlaceFinal)
        
        if (!response.ok) {
            await m.react('❌')
            return conn.reply(m.chat, `❌ Error del servidor externo al procesar el renderizado del sticker.`, m)
        }

        let bufferSticker = await response.buffer()

        await conn.sendMessage(m.chat, { 
            sticker: bufferSticker
        }, { quoted: m })

        await m.react('🔥')

    } catch (e) {
        console.error(e)
        await m.react('❌')
    }
}

handler.help = ['brat', 'bratanimado']
handler.tags = ['sticker']
handler.command = /^(bratv|bratanimado|bratgif)$/i

export default handler
