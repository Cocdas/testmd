const { cmd } = require('../command');

// Pair code generator function
function generatePairCode() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let pairCode = '';
  for (let i = 0; i < 8; i++) { // 8-character pair code
    const randomIndex = Math.floor(Math.random() * characters.length);
    pairCode += characters.charAt(randomIndex);
  }
  return pairCode;
}

// Session ID generator function
function generateSessionId() {
  const prefix = "SID";
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let sessionId = prefix;
  for (let i = 0; i < 16; i++) { // 16-character session ID
    const randomIndex = Math.floor(Math.random() * characters.length);
    sessionId += characters.charAt(randomIndex);
  }
  return sessionId;
}

cmd({
  pattern: "pair",
  react: "🔗",
  desc: "Generate a pair code and session ID",
  category: "main",
  use: '.pair',
  filename: __filename
},
  async (conn, mek, m, { from, reply }) => {
    try {
      // Generate the pair code and session ID
      const pairCode = generatePairCode();
      const sessionId = generateSessionId();

      // Create a message with the pair code and session ID
      const pairMessage = `
┏━━━━━━━━━━━━━━━┓
┃ *🔗 Pair Code Generator* 
┣━━━━━━━━━━━━━━━┛
┃
┃  *Your Pair Code:* ${pairCode}
┃  🔑 Keep it safe!
┃
┃  *Session ID:* ${sessionId}
┃  🔗 Use this code to pair your device and access the session.
┃
┣━━━━━━━━━━━━━━━┓
┃   ⚡ *DIZER MD* ⚡
┗━━━━━━━━━━━━━━━┛
`;

      // Send the pair code and session ID as a reply
      await conn.sendMessage(from, { text: pairMessage }, { quoted: mek });

      // Optionally, you can store the pair code and session ID in a database here

    } catch (e) {
      reply('*Error occurred!!*');
      console.log(e);
    }
  });
