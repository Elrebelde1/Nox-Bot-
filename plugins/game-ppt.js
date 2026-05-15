let activeGames = new Map();

const gameHandler = async (m, { conn, command, args, usedPrefix }) => {
    const mentionedJid = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
    const userChoice = command.toLowerCase() === 'rival' ? null : args[0]?.toLowerCase();

    // 1. MENÚ PRINCIPAL (.game)
    if (command === 'game' && args.length === 0 && !mentionedJid) {
        const caption = `🎮 *P.P.T - SELECCIÓN*\n\n¿Contra quién quieres medirte hoy?`;
        const buttons = [
            { buttonId: `${usedPrefix}game bot`, buttonText: { displayText: "🤖 Contra el Bot" }, type: 1 },
            { buttonId: `${usedPrefix}game member_tag`, buttonText: { displayText: "👥 Contra un Miembro" }, type: 1 }
        ];

        return await conn.sendMessage(m.chat, { 
            text: caption, 
            buttons: buttons,
            viewOnce: true 
        }, { quoted: m });
    }

    // 2. RESPUESTA AL BOTÓN "CONTRA UN MIEMBRO"
    if (args[0] === 'member_tag') {
        return conn.reply(m.chat, `⏭️ *¡Excelente!*\n\nPara jugar contra alguien, usa el comando:\n*${usedPrefix}rival @usuario*`, m);
    }

    // 3. INICIO DE PARTIDA (Vía .game bot o .rival @tag)
    if (args[0] === 'bot' || command === 'rival') {
        if (command === 'rival' && !mentionedJid) {
            return conn.reply(m.chat, `⚠️ Debes etiquetar a alguien para jugar.\nEjemplo: *${usedPrefix}rival @tag*`, m);
        }
        
        if (mentionedJid === m.sender) return conn.reply(m.chat, `❌ No puedes jugar contra ti mismo.`, m);

        let opponent = mentionedJid ? mentionedJid : 'bot';
        activeGames.set(m.chat, { player1: m.sender, player2: opponent });

        const oppName = opponent === 'bot' ? 'el Bot' : `@${opponent.split('@')[0]}`;
        const caption = `🕹️ *PARTIDA INICIADA*\n\n*Retador:* @${m.sender.split('@')[0]}\n*Oponente:* ${oppName}\n\n¡Haz tu elección!`;

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

    // 4. PROCESAR RESULTADO
    let choices = ['piedra', 'papel', 'tijera'];
    if (choices.includes(userChoice)) {
        if (!activeGames.has(m.chat)) return;

        let botChoice = choices[Math.floor(Math.random() * choices.length)];
        let result = getResult(userChoice, botChoice);

        const resultText = `
🕹️ *RESULTADOS*
──────────────
🙋‍♂️ *Elegiste:* ${userChoice.toUpperCase()}
🤖 *Oponente:* ${botChoice.toUpperCase()}
──────────────
📌 *Resultado:* ${result}
`.trim();

        const endButtons = [
            { buttonId: `${usedPrefix}game`, buttonText: { displayText: "🔄 Nuevo Juego" }, type: 1 }
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
    if ((user === 'piedra' && bot === 'tijera') || (user === 'papel' && bot === 'piedra') || (user === 'tijera' && bot === 'papel')) {
        return "🎉 ¡Ganaste!";
    }
    return "😢 Perdiste...";
}

gameHandler.help = ['game', 'rival @tag'];
gameHandler.tags = ['game'];
gameHandler.command = /^(game|rival)$/i; // Aquí detecta ambos comandos

export default gameHandler;
