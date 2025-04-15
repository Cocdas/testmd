const config = require('../config')
const { cmd } = require('../command')
const axios = require('axios')
const { fetchJson } = require('../lib/functions') 

const apilink = 'https://dark-yasiya-news-apis.vercel.app/api' // API LINK (DO NOT CHANGE)

// Helper function to format the news
const formatNews = (newsType, emoji, news) => {
    return `
   ${emoji} *_${newsType} NEWS_* ${emoji}

📰 *Title*: _${news.result.title}_
📝 *Description*: _${news.result.desc}_
📅 *Date*: _${news.result.date || 'Not available'}_
🔗 *Link*: [Click here to read](${news.result.url})

*Powered by Dizer*
    `;
}

// Helper function to handle errors
const handleError = (e, reply) => {
    console.log(e);
    reply('⚠️ Oops! Something went wrong while fetching the news. Please try again later.');
}

// ================================HIRU NEWS========================================

cmd({
    pattern: "hirunews",
    alias: ["hiru","news1"],
    react: "🌟",
    desc: "Get the latest news from Hiru TV.",
    category: "news",
    use: '.hirunews',
    filename: __filename
},
async (conn, mek, m, {from, quoted, reply }) => {
try {
    const news = await fetchJson(`${apilink}/hiru`);
    const msg = formatNews('HIRU', '🌟', news);
    await conn.sendMessage(from, { image: { url: news.result.image || '' }, caption: msg }, { quoted: mek });
} catch (e) {
    handleError(e, reply);
}
});

// ================================SIRASA NEWS========================================

cmd({
    pattern: "sirasanews",
    alias: ["sirasa","news2"],
    react: "🚨",
    desc: "Get the latest breaking news from Sirasa.",
    category: "news",
    use: '.sirasanews',
    filename: __filename
},
async (conn, mek, m, {from, quoted, reply }) => {
try {
    const news = await fetchJson(`${apilink}/sirasa`);
    const msg = formatNews('SIRASA', '🚨', news);
    await conn.sendMessage(from, { image: { url: news.result.image || '' }, caption: msg }, { quoted: mek });
} catch (e) {
    handleError(e, reply);
}
});

// ================================DERANA NEWS========================================

cmd({
    pattern: "derananews",
    alias: ["derana","news3"],
    react: "📰",
    desc: "Get the latest top headlines from Derana.",
    category: "news",
    use: '.derananews',
    filename: __filename
},
async (conn, mek, m, {from, quoted, reply }) => {
try {
    const news = await fetchJson(`${apilink}/derana`);
    const msg = formatNews('DERANA', '📰', news);
    await conn.sendMessage(from, { image: { url: news.result.image || '' }, caption: msg }, { quoted: mek });
} catch (e) {
    handleError(e, reply);
}
});

// ================================ADA DERANA NEWS========================================

cmd({
    pattern: "adaderananews",
    alias: ["adaderana","news4"],
    react: "🗞️",
    desc: "Get the latest exclusive news from Ada Derana.",
    category: "news",
    use: '.adaderananews',
    filename: __filename
},
async (conn, mek, m, {from, quoted, reply }) => {
try {
    const news = await fetchJson(`${apilink}/adaderana`);
    const msg = formatNews('ADA DERANA', '🗞️', news);
    await conn.sendMessage(from, { image: { url: news.result.image || '' }, caption: msg }, { quoted: mek });
} catch (e) {
    handleError(e, reply);
}
});
