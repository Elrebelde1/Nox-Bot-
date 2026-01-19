let handler = async (m, { conn, isRowner }) => {
    let _muptime;
    let totalreg = Object.keys(global.db.data.users).length;
    let totalchats = Object.keys(global.db.data.chats).length;
    let pp = 'https://cdn-sunflareteam.vercel.app/images/fe2072569a.jpg'; // Usamos la URL de la imagen aquí

    if (process.send) {
        process.send('uptime');
        _muptime = await new Promise(resolve => {
            process.once('message', resolve);
            setTimeout(resolve, 1000);
        }) * 1000;
    }

    let muptime = clockString(_muptime);
    const chats = Object.entries(conn.chats).filter(([id, data]) => id && data.isChats);
    const groupsIn = chats.filter(([id]) => id.endsWith('@g.us'));
    const used = process.memoryUsage();
    let Sisked = `╭─⬣「 *Estado De sᥲsᥙkᥱ ᑲ᥆𝗍 mძ 🌀* 」⬣\n`;
    Sisked += `│ 👤 *Creador ∙* Barboza\n`;
    Sisked += `│ 💎 *Grupos Unidos ∙* ${groupsIn.length}\n`;
    Sisked += `│ 💨 *Chats Privados ∙* ${chats.length - groupsIn.length}\n`;
    Sisked += `│ 🪙 *Total De Chats ∙* ${chats.length}\n`;
    Sisked += `│ 💰 *Usuarios Registrados ∙* ${totalreg}\n`;
    Sisked += `│ 🪄 *Grupos Registrados ∙* ${totalchats}\n`;
    Sisked += `│ 💸 *Actividad ∙* ${muptime}\n`;
    Sisked += `╰─⬣`;
    
    await conn.sendFile(m.chat, pp, 'nino.jpg', Sisked, fkontak, null, rcanal);
}

handler.help = ['status'];
handler.tags = ['info'];
handler.command = /^(estado|info|estate|state|stado|stats)$/i;
handler.register = true
export default handler;

function clockString(ms) {
    let h = Math.floor(ms / 3600000);
    let m = Math.floor(ms / 60000) % 60;
    let s = Math.floor(ms / 1000) % 60;
    console.log({ ms, h, m, s });
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}