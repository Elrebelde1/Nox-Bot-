// code creador por barboza 
// Se te agradece que dejes mis créditos gracias disfruta el código

import axios from "axios"

const handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(m.chat, `*¡Hola!* ¿A qué usuario de TikTok quieres stalkear?\n\n*Ejemplo:* ${usedPrefix}${command} twice_tiktok_official`, m)

    await m.react('🔍')

    try {
        const apiUrl = `https://api.delirius.store/tools/tiktokstalk?q=${encodeURIComponent(text)}`
        const { data } = await axios.get(apiUrl)

        if (!data.status || !data.result) throw new Error()

        const { users, stats } = data.result
        
        let txt = `*〔 TIKTOK STALK 〕*\n\n`
        txt += `👤 *Nickname:* ${users.nickname}\n`
        txt += `🆔 *Username:* @${users.username}\n`
        txt += `✅ *Verificado:* ${users.verified ? 'Sí' : 'No'}\n`
        txt += `📝 *Bio:* ${users.signature || 'Sin biografía'}\n\n`
        txt += `📊 *ESTADÍSTICAS*\n`
        txt += `👥 *Seguidores:* ${stats.followerCount.toLocaleString()}\n`
        txt += `👣 *Siguiendo:* ${stats.followingCount.toLocaleString()}\n`
        txt += `❤️ *Likes:* ${stats.heartCount.toLocaleString()}\n`
        txt += `🎬 *Videos:* ${stats.videoCount.toLocaleString()}\n\n`
        txt += `🔗 *Link:* ${users.url}\n\n`
        txt += `*By: Barboza Developer*`

        await conn.sendMessage(m.chat, { 
            image: { url: users.avatarLarger }, 
            caption: txt 
        }, { quoted: m })

        await m.react('✅')

    } catch (e) {
        await m.react('❌')
        await conn.reply(m.chat, `⚠️ No logré encontrar al usuario. Verifica que el nombre esté bien escrito.`, m)
    }
}

handler.help = ['tiktokstalk']
handler.tags = ['tools']
handler.command = ['tiktokuser1', 'ttstalk']

export default handler
