/**
 * 📂 COMANDO: githubstalk
 * 📝 DESCRIPCIÓN: Muestra información detallada de un usuario de GitHub.
 * 👤 CREADOR: Barboza Developer
 * ⚡ CANAL: Barboza Developer x Zona Developers
 * 🔌 API: https://api.evogb.org
 */

import axios from 'axios'

var handler = async (m, { conn, text, usedPrefix, command }) => {
    let username = text ? text.trim() : (m.quoted?.text || null)
    if (!username) return conn.reply(m.chat, `✨ *Ingresa el nombre de usuario de GitHub*\n\n> *Ejemplo:* ${usedPrefix + command} leoxito`, m)

    await m.react('🔍')

    try {
        const _0x4a1b = 'ZWt1c2Fz' 
        const key = Buffer.from(_0x4a1b, 'base64').toString('utf-8').split('').reverse().join('')

        const { data } = await axios.get(`https://api.evogb.org/stalking/github?username=${encodeURIComponent(username)}&key=${key}`)

        if (!data.status) {
            await m.react('❌')
            return m.reply('⚠️ *No se encontró el usuario en GitHub.*')
        }

        const user = data.result
        let ui = `┏━━━━━━━━━━━━━━━━┓\n`
        ui += `┃   🐙 *GITHUB STALK* ┃\n`
        ui += `┗━━━━━━━━━━━━━━━━┛\n\n`
        ui += `👤 *NOMBRE:* ${user.name || 'No disponible'}\n`
        ui += `🆔 *USER:* ${user.username}\n`
        ui += `📝 *BIO:* ${user.bio || 'Sin biografía'}\n`
        ui += `📍 *UBICACIÓN:* ${user.location}\n\n`
        ui += `📊 *ESTADÍSTICAS:*\n`
        ui += `⭐ *Stars:* ${user.stats.total_stars}\n`
        ui += `🍴 *Forks:* ${user.stats.total_forks}\n`
        ui += `👥 *Seguidores:* ${user.stats.followers}\n`
        ui += `📦 *Repos Públicos:* ${user.stats.public_repos}\n\n`
        ui += `🔗 *PERFIL:* ${user.profile_url}\n\n`
        ui += `━━━━━━━━━━━━━━━━━━━━\n`
        ui += `⚡ *By: Barboza Developer*\n`
        ui += `🌐 *Zona Developers*`

        await conn.sendMessage(m.chat, { 
            image: { url: user.avatar }, 
            caption: ui 
        }, { quoted: m })
        
        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        m.reply('⚠️ *Error al conectar con el servicio de Stalking.*')
    }
}

handler.help = ['githubstalk']
handler.tags = ['tools']
handler.command = /^(githubstalk|github|ghstalk)$/i

export default handler
