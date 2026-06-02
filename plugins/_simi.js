/**
 * 📂 COMANDO: Uchiha AI Chat (GPT4 Session)
 * 📝 DESCRIPCIÓN: Interactúa con la IA manteniendo un historial de conversación por sesión.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import fetch from "node-fetch"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        let alert = `⛩️ *SISTEMA UCHIHA AI* ⛩️\n`
        alert += `✧ ────────────────── ✧\n`
        alert += `> *Ingresa un texto para hablar con la IA.*\n`
        alert += `> *Uso:* ${usedPrefix + command} Hola bro`
        return conn.reply(m.chat, alert, m)
    }

    await m.react('💬')

    try {
        const aiEndpoint = "https://api.evogb.org/ai/gpt4-session"
        const access = Buffer.from("c2FzdWtl", 'base64').toString('utf-8')

        if (!conn.uchihachat) conn.uchihachat = {}
        if (!conn.uchihachat[m.sender]) {
            conn.uchihachat[m.sender] = {
                sessionId: Math.floor(10000000 + Math.random() * 90000000).toString()
            }
        }

        const currentSession = conn.uchihachat[m.sender].sessionId
        const requestUrl = `${aiEndpoint}?text=${encodeURIComponent(text)}&session=${currentSession}&key=${access}`

        let response = await fetch(requestUrl)
        let json = await response.json()

        if (json && json.status === true && json.result) {
            const dev = "⚡ 𝑩𝒂𝒓𝒃𝒐𝒛𝒂 𝑫𝒆𝒗𝒆𝒍𝒐𝒑𝒆𝒓"
            const net = "⛩️ 𝑼𝒄𝒉𝒊𝒉𝒂 𝑩𝒐𝒕 𝑵𝒆𝒕"

            let replyText = `${json.result}\n\n`
            replyText += `|═══════════════════\n`
            replyText += `| 🛠️ *${dev}*\n`
            replyText += `| ⛩️ *${net}*`

            await conn.reply(m.chat, replyText, m)
            await m.react('🔥')
        } else {
            await m.react('❌')
            return conn.reply(m.chat, `❌ El servidor de IA no devolvió una respuesta válida.`, m)
        }

    } catch (e) {
        console.error(e)
        await m.react('❌')
    }
}

handler.help = ['chat', 'ia', 'sasukeai']
handler.tags = ['ai']
handler.command = /^(sasukeai)$/i

export default handler
