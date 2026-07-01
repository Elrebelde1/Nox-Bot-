let handler = async (m) => {
    const used = process.memoryUsage()
    m.reply(`Consumo de RAM: ${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`)
}
handler.help = ['ram']
handler.tags = ['main']
handler.command = ['ram']
export default handler
