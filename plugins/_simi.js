/**
 * 📂 COMANDO: Uchiha AI Chat (GPT4 Session)
 * 📝 DESCRIPCIÓN: Interactúa con la IA manteniendo un historial de conversación por sesión.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    let consulta = text || (m.quoted && m.quoted.text ? m.quoted.text : '')

    if (!consulta) {
        let mensajeAyuda = `╭━━━⚡ 【 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖴𝖢𝖧𝖨𝖧𝖠 𝖨𝖭𝖳𝖤𝖫𝖨𝖦𝖤𝖭𝖢𝖨𝖠 𝖠𝖱𝖳𝖨𝖥𝖨𝖢𝖨𝖠𝖫 】 ⚡━━━╮\n`
        mensajeAyuda += `┃\n`
        mensajeAyuda += `┃ 🟢 *ESTADO:* Nodo de proceso activo esperando consulta...\n`
        mensajeAyuda += `┃ ⚠️ *AVISO:* Debes proporcionar un texto o mensaje para iniciar la interacción.\n`
        mensajeAyuda += `┃\n`
        mensajeAyuda += `┃ 📖 *INSTRUCCIONES DE USO:* \n`
        mensajeAyuda += `┃ > ${usedPrefix + command} Explícame cómo funciona la inteligencia artificial.\n`
        mensajeAyuda += `┃\n`
        mensajeAyuda += `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯`
        return conn.reply(m.chat, mensajeAyuda, m)
    }

    await m.react('🧬')

    try {
        const aiEndpoint = "https://api.evogb.org/ai/gpt4-session"
        const access = Buffer.from("c2FzdWtl", 'base64').toString('utf-8')

        if (!conn.uchihachat) conn.uchihachat = {}
        if (!conn.uchihachat[m.sender]) {
            conn.uchihachat[m.sender] = {
                sessionId: "SID_" + Math.floor(10000000 + Math.random() * 90000000).toString()
            }
        }

        const sessionID = conn.uchihachat[m.sender].sessionId
        const urlPeticion = `${aiEndpoint}?text=${encodeURIComponent(consulta)}&session=${sessionID}&key=${access}`

        let respuesta = await fetch(urlPeticion)
        let json = await respuesta.json()

        if (json && json.status === true && json.result) {
            const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
            const net = "⛩️ 𝖴𝖼𝗁𝗂𝗁𝖺 𝖡𝗈𝗍 𝖭𝖾𝗍"

            let reporteFinal = `🧬 ═══ 〖 𝖱𝖤𝖯𝖮𝖱𝖳𝖤 𝖣𝖤 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 𝖴𝖢𝖧𝖨𝖧𝖠 〗 ═══ 🧬\n\n`
            reporteFinal += `${json.result}\n\n`
            reporteFinal += `📊 ─── 〖 𝖣𝖤𝖳𝖠𝖫𝖫𝖤𝖲 𝖣𝖤 𝖯𝖱𝖮𝖢𝖤𝖲𝖠𝖬𝖨𝖤𝖭𝖳𝖮 〗 ───\n`
            reporteFinal += `⬡ *MODELO:* Arquitectura GPT-4 Integrada\n`
            reporteFinal += `⬡ *ID SESIÓN:* ${sessionID}\n`
            reporteFinal += `⬡ *ESTADO:* Operación Exitosa\n`
            reporteFinal += `🤝 ─── 〖 𝖢𝖱𝖤𝖣𝖨𝖳𝖮𝖲 𝖣𝖤𝖫 𝖲𝖨𝖲𝖳𝖤𝖬𝖠 〗 ───\n`
            reporteFinal += `⬡ *DESARROLLADOR:* ${dev}\n`
            reporteFinal += `⬡ *RED BOT:* ${net}\n`
            reporteFinal += `■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■`

            await conn.reply(m.chat, reporteFinal, m)
            await m.react('🔥')
        } else {
            await m.react('❌')
            return conn.reply(m.chat, `❌ *ERROR:* No se pudo recuperar una respuesta estructurada del servidor central.`, m)
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
    }
}

handler.help = ['sasukeai']
handler.tags = ['ai']
handler.command = /^(sasukeai)$/i

export default handler
