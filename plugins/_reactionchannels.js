import chalk from 'chalk';

const targetChannels = [
    '120363423619689248@newsletter', 
    '120363414007802886@newsletter'
];

const reactionEmoji = '🔥';

let handler = m => m;

handler.before = async function (m, { conn }) {
    // Log para debug: te dirá en consola qué chat está recibiendo mensajes
    // console.log(chalk.blue(`[DEBUG] Mensaje recibido de: ${m.chat}`));

    if (targetChannels.includes(m.chat)) {
        try {
            // En canales, a veces m.key.id es necesario para la reacción
            await conn.sendMessage(m.chat, {
                react: {
                    text: reactionEmoji,
                    key: m.key
                }
            });
            console.log(chalk.bgGreen.black(`[ OK ] Reacción enviada por ${conn.user.name || 'Subbot'}`));
        } catch (e) {
            console.log(chalk.bgRed.white(`[ ERROR ] No se pudo reaccionar: ${e.message}`));
        }
    }
    return !0;
};

export default handler;
