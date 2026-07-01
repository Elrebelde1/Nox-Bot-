import fs from 'fs'
let handler = async (m) => {
    const tmpPath = './tmp'
    if (fs.existsSync(tmpPath)) {
        fs.readdirSync(tmpPath).forEach(file => fs.unlinkSync(`${tmpPath}/${file}`))
    }
    m.reply('Caché limpiada.')
}
handler.help = ['cleartmp']
handler.tags = ['main']
handler.command = ['cleartmp']
handler.rowner = true
export default handler
