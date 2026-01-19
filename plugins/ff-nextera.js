let handler = async (m, { isPrems, conn }) => {
    let time = global.db.data.users[m.sender].lastcofre + 86400000; // 86400000 24 Horas
    if (new Date() - global.db.data.users[m.sender].lastcofre < 0) {
        throw `[❗𝐈𝐍𝐅𝐎❗] 𝚈𝙰 𝚁𝙴𝙲𝙻𝙰𝙼𝙰𝚂𝚃𝙴 𝚃𝚄 𝙲𝙾𝙵𝚁𝙴\n𝚅𝙾𝙻𝚅𝙴 𝙴𝙽 *${msToTime(time - new Date())}* 𝙿𝙰𝚁𝙰 𝚅𝙾𝙻𝚅𝙴𝚁 𝙰 𝚁𝙴𝙲𝙻𝙰𝙼𝙰𝚁`;
    }

    let img = 'https://cdn.russellxz.click/2559d309.jpeg'; 
    let texto = `» 𝙈𝘼𝙋𝘼 𝘿𝙀 𝙉𝙀𝙓𝙏𝙀𝙍𝙍𝘼 𝙁𝙍𝙀𝙀 𝙁𝙄𝙍𝙀 ✅`;

    const fkontak = {
        "key": {
            "participants": "0@s.whatsapp.net",
            "remoteJid": "status@broadcast",
            "fromMe": false,
            "id": "Halo"
        },
        "message": {
            "contactMessage": {
                "vcard": `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        "participant": "0@s.whatsapp.net"
    };

    await conn.sendFile(m.chat, img, 'hades.jpg', texto, fkontak);
    global.db.data.users[m.sender].lastcofre = new Date().getTime(); // Cambié a getTime para mayor claridad
};

handler.command = ['nexterra']; 
handler.register = true
handler.admin = true;
export default handler;