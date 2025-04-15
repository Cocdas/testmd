
const fs = require('fs');
if (fs.existsSync('config.env')) require('dotenv').config({ path: './config.env' });

function convertToBool(text, fault = 'true') {
    return text === fault ? true : false;
}
module.exports = {
SESSION_ID: process.env.SESSION_ID || 'nYJHXAxa#8pg_TxJnSzSF1toDokFuhYvpEjnVK3lRWifa9eIaETw',
MONGODB: process.env.MONGODB || "mongodb://mongo:eGvcAWHazvNfBszykPSFbtLHXdlVzjil@junction.proxy.rlwy.net:15727",
};
