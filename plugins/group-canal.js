/**
 * 📂 COMANDO: Uchiha Brat Generator (Sylphy API)
 * 📝 DESCRIPCIÓN: Crea stickers estilo Brat personalizables usando el endpoint de Sylphy.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://sylphyy.xyz
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let contenidoTexto = text || (m.quoted && m.quoted.text ? m.quoted.text : '')

    if (!contenidoTexto) {
        let menuAlerta = `☠️ ═══ 〖 𝖡𝖱𝖠𝖳 𝖲𝖸𝖫𝖯𝖧𝖸 𝖦𝖤𝖭𝖤𝖱𝖠𝖳𝖮𝖱 〗 ═══ ☠️\n\n`
        menuAlerta += `☣️ *ESTADO:* Esperando parámetros de texto...\n`
        menuAlerta += `⚠️ *REQUISITO:* Por favor introduce el texto para el sticker.\n\n`
        menuAlerta += `📌 *EJEMPLO DE USO:* \n`
        menuAlerta += `> ${usedPrefix + command} Sasuke Uchiha\n`
        menuAlerta += `■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■`
        return conn.reply(m.chat, menuAlerta, m)
    }

    await m.react('🟢')

    try {
        const apiBrat = "https://sylphyy.xyz/tools/brat"
        const claveOculta = Buffer.from("c3lscGh5LTZmMTUwZA==", 'base64').toString('utf-8')
        const esAnimado = /animado|gif/i.test(command) ? 'Anim' : 'Static'
        
        const enlaceFinal = `${apiBrat}?text=${encodeURIComponent(contenidoTexto)}&color=Negro&fondo=Blanco&type=${esAnimado}&api_key=${claveOculta}`

        let response = await fetch(enlaceFinal)
        
        if (!response.ok) {
            await m.react('❌')
            return conn.reply(m.chat, `❌ Error del servidor externo al procesar el sticker de Sylphy.`, m)
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

handler.help = ['brat3', 'bratanimado3']
handler.tags = ['sticker']
handler.command = /^(brat3|bratanimado3|bratgif)$/i

export default handler
