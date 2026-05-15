let activeGames = new Map();

const gameHandler = async (m, { conn, command, args, usedPrefix }) => {
    const text = args.join(' ').toLowerCase();
    const mentionedJid = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);

    // ESCENARIO 1: Inicio del comando .game (Sin argumentos y sin mención)
    if (args.length === 0 && !mentionedJid) {
        const caption = `🎮 *MENÚ DE JUEGO*\n\n¿Contra quién quieres jugar Piedra, Papel o Tijera?`;
        const buttons = [
            { buttonId: `${usedPrefix}game bot`, buttonText: { displayText: "🤖 Contra el Bot" }, type: 1 },
            { buttonId: `${usedPrefix}game @user`, buttonText: { displayText: "👥 Contra un Miembro" }, type: 1 }
        ];

        return await conn.sendMessage(m.chat, { 
            text: caption, 
            buttons: buttons, 
            footer: 'Selecciona una opción',
            viewOnce: true 
        }, { quoted: m });
    }

    // ESCENARIO 2: Selección de "Contra un Miembro" (Instrucción de mencionar)
    if (args[0] === '@user' && !mentionedJid) {
        return conn.reply(m.chat, `Por favor, menciona a la persona con la que quieres jugar.\nEjemplo: *${usedPrefix}game @usuario*`, m);
    }

    // ESCENARIO 3: Inicio de partida (vs Bot o vs Usuario)
    if (!activeGames.has(m.chat) || args[0] === 'bot' || mentionedJid) {
        let opponent = mentionedJid ? mentionedJid : 'bot';
        
        activeGames.set(m.chat, {
            player1: m.sender,
            player2: opponent,
            status: 'waiting'
        });

        const oppName = opponent === 'bot' ? 'el Bot' : `@${opponent.split('@')[0]}`;
        const caption = `🕹️ *PARTIDA INICIADA*\n*Retador:* @${m.sender.split('@')[0]}\n*Oponente:* ${oppName}\n\nSelecciona tu jugada:`;

        const buttons = [
            { buttonId: `${usedPrefix}game piedra`, buttonText: { displayText: "🪨 Piedra" }, type: 1 },
            { buttonId: `${usedPrefix}game papel`, buttonText: { displayText: "📄 Papel" }, type: 1 },
            { buttonId: `${usedPrefix}game tijera`, buttonText: { displayText: "✂️ Tijera" }, type: 1 }
        ];

        return await conn.sendMessage(m.chat, {
            text: caption,
            buttons: buttons,
            mentions: [m.sender, ...(mentionedJid ? [mentionedJid] : [])],
            viewOnce: true
        }, { quoted: m });
    }

    // ESCENARIO 4: Procesar la jugada
    let choices = ['piedra', 'papel', 'tijera'];
    let userChoice = args[0];

    if (choices.includes(userChoice)) {
        let game = activeGames.get(m.chat);
        if (!game) return;

        let botChoice = choices[Math.floor(Math.random() * choices.length)];
        let result = getResult(userChoice, botChoice);

        const resultText = `
🕹️ *RESULTADOS*
──────────────
🙋‍♂️ *Tú:* ${userChoice.toUpperCase()}
🤖 *Bot:* ${botChoice.toUpperCase()}
──────────────
📌 *Estatus:* ${result}
`.trim();

        const endButtons = [
            { buttonId: `${usedPrefix}game`, buttonText: { displayText: "🔄 Juego Nuevo" }, type: 1 }
        ];

        await conn.sendMessage(m.chat, {
            text: resultText,
            buttons: endButtons,
            viewOnce: true
        }, { quoted: m });

        activeGames.delete(m.chat);
    }
};

function getResult(user, bot) {
    if (user === bot) return "🤝 ¡Empate!";
    if (
        (user === 'piedra' && bot === 'tijera') ||
        (user === 'papel' && bot === 'piedra') ||
        (user === 'tijera' && bot === 'papel')
    ) {
        return "🎉 ¡Ganaste!";
    }
    return "😢 Perdiste...";
}

gameHandler.help = ['game'];
gameHandler.tags = ['game'];
gameHandler.command = /^(game)$/i;

export default gameHandler;
