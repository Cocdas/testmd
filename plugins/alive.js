const { cmd } = require('../command');
const { runtime } = require('../lib/functions');

cmd({
  pattern: "alive",
  react: "🔋",
  desc: "Check if the bot is alive",
  category: "main",
  use: '.alive',
  filename: __filename
},
  async (conn, mek, m, { from, reply }) => {
    try {
      const aliveMessage = `
┏━━━━━━━━━━━━━━━┓
┃     🤖 *DIZER MD BOT* 🤖
┃
┣━━━━━━━━━━━━━━━┛
┃
┃  🟢 *Bot Status:* Online
┃  ⏳ *Uptime:* ${runtime(process.uptime())}
┃  💾 *RAM Usage:* ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
┃
┣━━━━━━━━━━━━━━━┓
┃   *🌟 Stay Connected* 🌟
┃
┣━🔥━━━━━━━━━━━━━🔥━┛
┃
┃    🎉 *Commands are ready* 🎉
┃
┣━━━━━━━━━━━━━━━━━━━━┓
┃     ⚡ *DIZER MD* ⚡
┗━━━━━━━━━━━━━━━━━━━━┛

      `;

      // Send the alive message
      await conn.sendMessage(from, { text: aliveMessage }, { quoted: mek });
    } catch (e) {
      reply('*Error !!*');
      console.log(e);
    }
  });

