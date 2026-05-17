import { existsSync, unlinkSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import yts from 'yt-search'
import YTDlpWrap from 'yt-dlp-wrap'

const ytDlpPath = './yt-dlp'

await YTDlpWrap.downloadFromGithub(ytDlpPath)

const ytDlp = new YTDlpWrap(ytDlpPath)

async function downloadAudio(url, output) {
  return new Promise((resolve, reject) => {
    ytDlp.exec([
      url,
      '--no-playlist',
      '-x',
      '--audio-format',
      'mp3',
      '--audio-quality',
      '128K',
      '--extractor-args',
      'youtube:player_client=android',
      '-o',
      output
    ])
    .on('close', () => {
      if (!existsSync(output)) {
        reject(new Error('No se generó el audio'))
      } else {
        resolve()
      }
    })
    .on('error', reject)
  })
}

const handler = async (m, { conn, args, usedPrefix }) => {
  if (!args[0]) {
    return conn.reply(
      m.chat,
      `🎧 Usa así:\n${usedPrefix}sonido <nombre>`,
      m
    )
  }

  const query = args.join(' ')
  const tempFile = join(tmpdir(), `audio_${Date.now()}.mp3`)

  try {
    await m.react('🔍')

    const search = await yts(query)

    if (!search.videos.length) {
      throw new Error('No encontrado')
    }

    const video = search.videos[0]

    const caption = `
╭─❍ 「 ʟᴏɴᴇʟʏ ᴍᴜsɪᴄ 」
│
├ 🎵 ${video.title}
├ ⏱️ ${video.timestamp}
├ 👀 ${video.views.toLocaleString()}
│
╰──────────────❍
`.trim()

    await conn.sendMessage(
      m.chat,
      {
        image: { url: video.thumbnail },
        caption
      },
      { quoted: m }
    )

    await m.react('📥')

    await downloadAudio(video.url, tempFile)

    await conn.sendMessage(
      m.chat,
      {
        audio: { url: tempFile },
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`,
        ptt: false
      },
      { quoted: m }
    )

    if (existsSync(tempFile)) {
      unlinkSync(tempFile)
    }

    await m.react('🟢')

  } catch (e) {
    if (existsSync(tempFile)) {
      unlinkSync(tempFile)
    }

    console.log(e)

    await m.react('🔴')

    return conn.reply(
      m.chat,
      '❌ Error al descargar el audio',
      m
    )
  }
}

handler.help = ['sonido']
handler.tags = ['descargas']
handler.command = /^(play)$/i

export default handler