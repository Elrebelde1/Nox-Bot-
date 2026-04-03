import fetch from 'node-fetch';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`🌙 INGRESE EL NOMBRE DE UNA CANCIÓN\n> *Ejemplo:* ${usedPrefix + command} Twice Strategy`);

    try {
        let searchRes = await fetch(`https://api.delirius.store/search/spotify?q=${encodeURIComponent(text)}&limit=1`);
        let searchJson = await searchRes.json();

        if (!searchJson.status || !searchJson.data.length) return m.reply("❌ Sin resultados.");

        let trackUrl = searchJson.data[0].url;

        let downloadRes = await fetch(`https://api.delirius.store/download/spotify?url=${trackUrl}`);
        let downloadJson = await downloadRes.json();

        if (!downloadJson.status) return m.reply("❌ Error en la descarga.");

        let { title, author, duration, image, download } = downloadJson.data;

        let mins = Math.floor(duration / 60000);
        let secs = ((duration % 60000) / 1000).toFixed(0);
        let time = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

        let caption = `\`𝚂𝙿𝙾𝚃𝙸𝙵𝚈 𝙿𝙻𝙰𝚈\`\n\n`
            + `☪︎ *Título:* ${title}\n`
            + `☪︎ *Artista:* ${author}\n`
            + `☪︎ *Duración:* ${time} min\n`
            + `───── ･ ｡ﾟ☆: *.☽ .* :☆ﾟ. ─────`;

        await conn.sendFile(m.chat, image, 'lp.jpg', caption, m);
        await conn.sendMessage(m.chat, { audio: { url: download }, mimetype: 'audio/mpeg', fileName: `${title}.mp3` }, { quoted: m });

    } catch (e) {
        m.reply("⚠️ Servicio no disponible.");
    }
}

handler.help = ['play', 'spotify'];
handler.tags = ['descargas'];
handler.command = ['play', 'spotify', 'spdl'];

export default handler;
