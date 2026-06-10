import path from 'path'

export async function all(m, chatUpdate) {
  if (m.isBaileys || !m.message || !m.msg || !m.msg.fileSha256) return

  const hash = Buffer.from(m.msg.fileSha256).toString('base64')
  if (!(hash in global.db.data.sticker)) return

  const { text: pluginName } = global.db.data.sticker[hash]
  const comandoLimpio = pluginName.replace('.js', '').trim()

  // Buscar el archivo dentro de los plugins cargados en la memoria del bot
  const archivoPlugin = Object.keys(global.plugins || {}).find(
    p => p.endsWith(pluginName) || path.basename(p) === pluginName
  )

  if (archivoPlugin && global.plugins[archivoPlugin]) {
    try {
      const plugin = global.plugins[archivoPlugin]
      
      // Forzar que el mensaje actual sea reconocido como el comando de texto (.menu)
      m.text = `.${comandoLimpio}`
      m.command = comandoLimpio
      
      // Ejecutar el módulo de comandos directamente usando el contexto del bot
      if (typeof plugin.default === 'function') {
        await plugin.default(m, {
          conn: this,
          text: '',
          args: [],
          usedPrefix: '.',
          command: m.command,
          isOwner: m.fromMe || global.opts['owner'],
          isAdmin: m.isGroup ? (await this.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants.find(p => p.id === m.sender)?.admin !== null : false,
          isROwner: m.fromMe || global.opts['owner'],
          participants: m.isGroup ? (await this.groupMetadata(m.chat).catch(() => ({ participants: [] }))).participants : []
        })
      }
    } catch (error) {
      console.error("[ERROR AL DISPARAR JUTSU MENU]:", error)
    }
  }
}
