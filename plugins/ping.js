const { cmd } = require('../command');
const { performance } = require('perf_hooks');

cmd({
  pattern: "ping",
  react: "🏓",
  desc: "Check bot's ping",
  category: "main",
  use: '.ping',
  filename: __filename
},
  async (conn, mek, m, { from, reply }) => {
    try {
      const startTime = performance.now(); // Time start

      // Send "Testing ping..." message
      const msg = await conn.sendMessage(from, { text: "🏓 *Testing Ping...*" }, { quoted: mek });

      const endTime = performance.now(); // Time end
      const ping = (endTime - startTime).toFixed(2); // Calculate ping time

      // Edit the message with the actual ping time
      await conn.sendMessage(from, { text: `🏓 *Pong!*\n📶 *Ping:* ${ping} ms` }, { quoted: mek });
    } catch (e) {
      reply('*Error occurred!!*');
      console.log(e);
    }
  });
