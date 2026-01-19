/* 
- Downloader Tiktokuser By Jose XrL
- Power By Team Code Titans
- https://whatsapp.com/channel/0029ValMlRS6buMFL9d0iQ0S 
*/
// *🍁 [ Tiktokuser Downloader ]*

import axios from 'axios';

let handler = async (m, { conn, usedPrefix, command, text}) => {
  if (!text) {
    return conn.reply(
      m.chat,
      `🚩 Ingresa el nombre de usuario de TikTok que deseas buscar.\n\nEjemplo:\n> *${usedPrefix + command} jose.xrl15*`,
      m
);
}

  await m.react('🕓');

  const username = text.replace(/^@/, '');

  try {
    const response = await axios.get(`https://apis-starlights-team.koyeb.app/starlight/tiktok-user-posts?user=${username}`);
    const data = response.data;

    if (data.status === 200 && data.data?.videos?.length> 0) {
      for (let i = 0; i < data.data.videos.length; i++) {
        const video = data.data.videos[i];
        let txt = '乂  *TIKTOK - DOWNLOAD*\n\n';
        txt += `✩ *Nro:* ${i + 1}\n`;
        txt += `✩ *Título:* ${video.title || 'Sin título'}\n`;
        txt += `✩ *Autor:* ${video.author.nickname}\n`;
        txt += `✩ *Duración:* ${video.duration} segundos\n`;
        txt += `✩ *Vistas:* ${video.play_count}\n`;
        txt += `✩ *Likes:* ${video.digg_count}\n`;
        txt += `✩ *Comentarios:* ${video.comment_count}\n`;
        txt += `✩ *Compartidos:* ${video.share_count}\n`;
        txt += `✩ *Publicado:* ${new Date(video.create_time * 1000).toLocaleString()}\n`;
        txt += `✩ *Descargas:* ${video.download_count}\n\n`;
        txt += `🚩 *Enlace al video:* ${video.play}`;

        await conn.sendMessage(m.chat, { video: { url: video.play}, caption: txt}, { quoted: m});
}
      await m.react('✅');
} else {
      await m.react('✖️');
      await conn.reply(m.chat, 'No se encontraron videos para este usuario.', m);
}
} catch (error) {
    console.error('Error al consultar TikTok:', error.response?.data || error.message);
    await m.react('✖️');
    await conn.reply(m.chat, 'Hubo un error al procesar la solicitud. Intenta de nuevo más tarde.', m);
}
};

handler.tags = ['downloader'];
handler.help = ['tiktokuser *<usuario>*'];
handler.command = ['tiktokuser', 'tiktokus'];
handler.register = true;

export default handler;