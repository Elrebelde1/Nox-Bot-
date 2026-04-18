
const targetChannels = [
    '120363391771490226@newsletter', 
    '120363397395029451@newsletter'
];

const reactionEmoji = '🔥'; // El emoji que usarán tus clones

let handler = m => m;

handler.before = async function (m, { conn }) {
    // 1. Verificamos si el mensaje proviene de uno de los canales objetivo
    // En Baileys, los mensajes de canales suelen venir con el JID en m.chat
    if (targetChannels.includes(m.chat)) {
        try {
            // 2. Retraso aleatorio para que no baneen los subbots por actividad simultánea
            const delay = Math.floor(Math.random() * 3000) + 1000;

            setTimeout(async () => {
                await conn.sendMessage(m.chat, {
                    react: {
                        text: reactionEmoji,
                        key: m.key
                    }
                });
                console.log(chalk.greenBright(`[Sasuke-Reaction] Reaccionando en canal: ${m.chat}`));
            }, delay);

        } catch (e) {
            // Silenciamos errores si el subbot no sigue al canal (no puede reaccionar si no es seguidor)
            return !0;
        }
    }
    return !0;
};

export default handler;
