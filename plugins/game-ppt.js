let activeGames = new Map();

const gameHandler = async (m, { conn, command, args, usedPrefix }) => {
    if (command === 'game' && args.length === 0) {
        activeGames.delete(m.chat); 
        
        const caption = `🎮 *P.P.T - SELECCIÓN*\n\n¿Contra quién quieres jugar?`;
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

    const mentionedJid = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : null);
    const userChoice = args[0]?.toLowerCase();

    if (userChoice === 'member_tag') {
        return conn.reply(m.chat, `⏭️ *¡Excelente!*\n\nPara jugar contra alguien, usa el comando:\n*${usedPrefix}rival @usuario*`, m);
    }

    if (userChoice === 'bot' || command === 'rival') {
        if (command === 'rival' && !mentionedJid) {
            return conn.reply(m.chat, `⚠️ Debes etiquetar a alguien.\nEjemplo: *${usedPrefix}rival @tag*`, m);
        }
        
        let opponent = mentionedJid ? mentionedJid : 'bot';
        if (opponent === m.sender) return conn.reply(m.chat, `❌ No puedes jugar contra ti mismo.`, m);

        activeGames.set(m.chat, { player1: m.sender, player2: opponent });

        const oppName = opponent === 'bot' ? 'el Bot' : `@${opponent.split('@')[0]}`;
        const caption = `🕹️ *PARTIDA INICIADA*\n\n*Retador:* @${m.sender.split('@')[0]}\n*Oponente:* ${oppName}\n\n¡Haz tu elección abajo!`;

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

    let choices = ['piedra', 'papel', 'tijera'];
    if (choices.includes(userChoice)) {
        let game = activeGames.get(m.chat);
        if (!game) return; 

        let botChoice = choices[Math.floor(Math.random() * choices.length)];
        let status = getResult(userChoice, botChoice);
        
        let winner, loser, resultMsg;
        const p1 = `@${game.player1.split('@')[0]}`;
        const p2 = game.player2 === 'bot' ? '🤖 Bot' : `@${game.player2.split('@')[0]}`;

        if (status === 'win') {
            winner = p1; loser = p2;
            resultMsg = `🎉 *GANADOR:* ${winner}\n💀 *PERDEDOR:* ${loser}`;
        } else if (status === 'lose') {
            winner = p2; loser = p1;
            resultMsg = `🎉 *GANADOR:* ${winner}\n💀 *PERDEDOR:* ${loser}`;
        } else {
            resultMsg = `🤝 *EMPATE*\nAmbos eligieron ${userChoice.toUpperCase()}`;
        }

        const captionResult = `🕹️ *RESULTADOS FINALES*\n──────────────\n🙋‍♂️ ${p1}: ${userChoice.toUpperCase()}\n🤖 ${p2}: ${botChoice.toUpperCase()}\n──────────────\n${resultMsg}`;

        const endButtons = [
            { buttonId: `${usedPrefix}game`, buttonText: { displayText: "🔄 Juego Nuevo" }, type: 1 }
        ];

        await conn.sendMessage(m.chat, {
            text: captionResult,
            buttons: endButtons,
            mentions: [game.player1, ...(game.player2 !== 'bot' ? [game.player2] : [])],
            viewOnce: true
        }, { quoted: m });

        activeGames.delete(m.chat);
    }
};

function getResult(user, bot) {
    if (user === bot) return "tie";
    if ((user === 'piedra' && bot === 'tijera') || (user === 'papel' && bot === 'piedra') || (user === 'tijera' && bot === 'papel')) return "win";
    return "lose";
}

gameHandler.command = /^(game|rival)$/i;
export default gameHandler;
