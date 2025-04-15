
const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || "nYJHXAxa#8pg_TxJnSzSF1toDokFuhYvpEjnVK3lRWifa9eIaETw",
MONGODB: process.env.MONGODB || "mongodb://mongo:tmhBEDccuyNbqkcFwMETLoGMzreoiLEL@viaduct.proxy.rlwy.net:57919",
ALIVE_IMG: process.env.ALIVE_IMG || "https://i.ibb.co/QF3pFFC9/1797.jpg",
BOT_NAME: process.env.BOT_NAME || "DIZER-MD",
LANG: process.env.BOT_LANG || 'EN' ,
OMDB_API_KEY: process.env.OMDB_API_KEY || "76cb7f39",
};
