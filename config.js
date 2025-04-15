
const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}

module.exports = {
    // Bot settings
    PREFIX: "!", // Default command prefix
    SESSION_ID: process.env.SESSION_ID || "nYJHXAxa#8pg_TxJnSzSF1toDokFuhYvpEjnVK3lRWifa9eIaETw", // Session ID for auth
    MODE: process.env.MODE || "public", // Bot mode: public, private, inbox, groups
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://mongo:eGvcAWHazvNfBszykPSFbtLHXdlVzjil@junction.proxy.rlwy.net:15727", // MongoDB connection URI
    
    // Auto features
    AUTO_READ_STATUS: process.env.AUTO_READ_STATUS || "true", // Auto read status messages
    AUTO_READ_CMD: process.env.AUTO_READ_CMD || "true", // Auto read command messages
    AUTO_VOICE: process.env.AUTO_VOICE || "true", // Enable auto voice responses
    AUTO_BIO: process.env.AUTO_BIO || "true", // Enable auto biography update
    
    // Presence settings
    ALWAYS_TYPING: process.env.ALWAYS_TYPING || "true", // Always show typing indicator
    ALWAYS_RECORDING: process.env.ALWAYS_RECORDING || "false", // Always show recording indicator
    
    // API keys & settings (add as needed)
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "", // OpenAI API key
    
    // Bot info
    BOT_NAME: process.env.BOT_NAME || "HYPER-MD",
    BOT_VERSION: "1.0.0",
    OWNER_NAME: process.env.OWNER_NAME || "Mr Senesh",
    OWNER_NUMBER: process.env.OWNER_NUMBER || "94787351423",
    
    // Group settings
    ANTILINK: process.env.ANTILINK || "false", // Enable/disable antilink feature in groups
    ANTISPAM: process.env.ANTISPAM || "false", // Enable/disable antispam feature
    WELCOME_MSG: process.env.WELCOME_MSG || "Welcome to the group, {{user}}!", // Welcome message for groups
    EXIT_MSG: process.env.EXIT_MSG || "Goodbye {{user}}!", // Exit message for groups
    
    // Limits
    MAX_FILESIZE: process.env.MAX_FILESIZE || 100, // Max file size in MB
};
