const { cmd } = require('../command');
const { fetchJson, sleep } = require('../lib/functions');
const fs = require('fs');
const path = require('path');

//---------------------------------------------------------------------------

cmd({
  pattern: "save",
  react: "📥",
  alias: ["savestatus", "downloadstatus"],
  desc: "Download WhatsApp status with details.",
  category: "download",
  use: '.save <number>',
  filename: __filename
},
  async (conn, mek, m, { from, args, sender, reply }) => {
    try {
      const targetNumber = args[0]; // Status number to download

      if (!targetNumber) return reply("Please provide a valid number to download the status.");

      // Fetch status for the target number
      const statuses = await conn.fetchStatus(targetNumber);

      if (!statuses || statuses.length === 0) {
        return reply("🚫 *No status found for the given number!*");
      }

      for (let status of statuses) {
        const statusType = status.type; // Video or Image status
        const timePosted = new Date(status.timestamp * 1000).toLocaleString(); // Convert timestamp to readable format
        const caption = status.caption || "No caption available"; // Get status caption

        // Download image or video status
        const mediaPath = await conn.downloadMediaMessage(status);

        const fileType = statusType === 'video' ? 'mp4' : 'jpg';
        const fileName = path.join(__dirname, `../downloads/status_${targetNumber}.${fileType}`);

        fs.writeFileSync(fileName, mediaPath);
        await sleep(1000); // Wait a little before sending

        // Add emojis and details
        const statusDetails = `
🌟 *Status from:* +${targetNumber}
🕒 *Posted on:* ${timePosted}
📄 *Caption:* ${caption}
📁 *Type:* ${statusType === 'video' ? '🎥 Video' : '🖼️ Image'}
        `;

        // Send the downloaded file with details
        await conn.sendMessage(from, {
          [statusType]: { url: fileName },
          caption: `${statusDetails} \n\n🚀 *Status saved successfully!*`
        }, { quoted: mek });

        // Remove the file after sending
        fs.unlinkSync(fileName);
      }
    } catch (error) {
      reply(`❌ *Error occurred:* ${error.message}`);
    }
  });
