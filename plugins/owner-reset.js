let handler = async (m, { conn }) => {
    await m.react('🔄')
    await m.reply('🛸 *[ NOX BOT MD ]* 🌌\n\n> *Reiniciando sistema, por favor espere...*')
    process.send('reset')
}

handler.help = ['reset']
handler.tags = ['owner']
handler.command = ['reset']
handler.rowner = true

export default handler
