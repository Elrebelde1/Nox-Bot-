let handler = async (m, { conn }) => {
    let link = await conn.groupInviteCode(m.chat)
    m.reply(`https://chat.whatsapp.com/${link}`)
}

handler.help = ['link']
handler.tags = ['grupos']
handler.command = ['link', 'linkgroup']

export default handler
