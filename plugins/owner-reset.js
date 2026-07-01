let handler = async (m, { conn }) => {
    m.reply('Reiniciando sistema...')
    process.send('reset')
}

handler.help = ['reset']
handler.tags = ['owner']
handler.command = ['reset']
handler.rowner = true

export default handler
