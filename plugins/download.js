/**
 * HYPER-MD WhatsApp Bot - Downloader Plugin
 * 
 * Download content from various platforms
 */

const { register } = require('../command')
const { getBuffer, fetchJson, createTempFile } = require('../lib/functions')
const axios = require('axios')
const fs = require('fs')

// TikTok downloader
register({
    pattern: 'tiktok',
    alias: ['tt', 'tik'],
    desc: 'Download TikTok videos',
    category: 'downloader',
    usage: 'tiktok [url]',
    react: '🎵',
    function: async (conn, mek, m, { args, reply, q }) => {
        if (!q) return reply('Please provide a TikTok URL')
        
        try {
            await m.react('⏳')
            
            // Extract TikTok URL from text
            const urlPattern = /(https?:\/\/[^\s]+tiktok[^\s]+)/gi
            const matches = q.match(urlPattern)
            
            if (!matches || matches.length === 0) {
                m.react('❌')
                return reply('Invalid TikTok URL. Please provide a valid TikTok link.')
            }
            
            const url = matches[0]
            
            // Use TikTok API to get download links
            const apiUrl = `https://api.lolhuman.xyz/api/tiktok?apikey=GataDios&url=${encodeURIComponent(url)}`
            
            const response = await axios.get(apiUrl)
            
            if (!response.data || response.data.status !== 200) {
                throw new Error('Failed to fetch TikTok data')
            }
            
            const result = response.data.result
            const videoUrl = result.link
            const caption = `*TikTok Downloader*\n\n👤 *Author:* ${result.author.nickname} (@${result.author.username})\n📝 *Description:* ${result.description}\n❤️ *Likes:* ${result.statistic.like_count}\n🔄 *Shares:* ${result.statistic.share_count}\n💬 *Comments:* ${result.statistic.comment_count}\n👁️ *Views:* ${result.statistic.play_count}\n\n_Downloaded by HYPER-MD Bot_`
            
            // Download and send the video
            await conn.sendMessage(m.chat, {
                video: { url: videoUrl },
                caption: caption,
                gifPlayback: false
            }, { quoted: mek })
            
            m.react('✅')
        } catch (error) {
            console.error('Error in TikTok command:', error)
            m.react('❌')
            reply(`Error downloading TikTok: ${error.message}`)
        }
    }
})

// YouTube downloader
register({
    pattern: 'ytmp4',
    alias: ['yt', 'ytvideo'],
    desc: 'Download YouTube videos',
    category: 'downloader',
    usage: 'ytmp4 [url/search]',
    react: '📹',
    function: async (conn, mek, m, { args, reply, q }) => {
        if (!q) return reply('Please provide a YouTube URL or search term')
        
        try {
            await m.react('⏳')
            
            // Check if input is a URL or search term
            const isUrl = q.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
            
            let videoId
            let videoInfo
            
            if (isUrl) {
                // Extract video ID from URL
                videoId = isUrl[1]
                
                // Get video info
                const infoUrl = `https://api.lolhuman.xyz/api/ytvideo?apikey=GataDios&url=https://www.youtube.com/watch?v=${videoId}`
                const infoResponse = await axios.get(infoUrl)
                
                if (!infoResponse.data || infoResponse.data.status !== 200) {
                    throw new Error('Failed to fetch YouTube video data')
                }
                
                videoInfo = infoResponse.data.result
            } else {
                // Search YouTube
                const searchUrl = `https://api.lolhuman.xyz/api/ytsearch?apikey=GataDios&query=${encodeURIComponent(q)}`
                const searchResponse = await axios.get(searchUrl)
                
                if (!searchResponse.data || searchResponse.data.status !== 200 || !searchResponse.data.result || searchResponse.data.result.length === 0) {
                    throw new Error('No YouTube videos found for the search query')
                }
                
                // Use the first result
                const firstResult = searchResponse.data.result[0]
                videoId = firstResult.videoId
                
                // Get video info
                const infoUrl = `https://api.lolhuman.xyz/api/ytvideo?apikey=GataDios&url=https://www.youtube.com/watch?v=${videoId}`
                const infoResponse = await axios.get(infoUrl)
                
                if (!infoResponse.data || infoResponse.data.status !== 200) {
                    throw new Error('Failed to fetch YouTube video data')
                }
                
                videoInfo = infoResponse.data.result
            }
            
            // Check if video is too large
            if (parseInt(videoInfo.link.size) > 100 * 1024 * 1024) { // 100MB limit
                m.react('⚠️')
                return reply(`⚠️ Video is too large (${Math.round(parseInt(videoInfo.link.size) / (1024 * 1024))}MB). Maximum allowed size is 100MB. Try using the audio-only version with !ytmp3`)
            }
            
            // Create caption
            const caption = `*YouTube Downloader*\n\n📹 *Title:* ${videoInfo.title}\n👤 *Channel:* ${videoInfo.uploader}\n⏱️ *Duration:* ${videoInfo.duration}\n👁️ *Views:* ${videoInfo.view}\n📅 *Published:* ${videoInfo.published}\n\n_Downloaded by HYPER-MD Bot_`
            
            // Send thumbnail and info first
            await conn.sendMessage(m.chat, {
                image: { url: videoInfo.thumbnail },
                caption: caption
            }, { quoted: mek })
            
            // Send video file
            await conn.sendMessage(m.chat, {
                video: { url: videoInfo.link.link },
                mimetype: 'video/mp4',
                fileName: `${videoInfo.title}.mp4`
            }, { quoted: mek })
            
            m.react('✅')
        } catch (error) {
            console.error('Error in YouTube command:', error)
            m.react('❌')
            reply(`Error downloading YouTube video: ${error.message}`)
        }
    }
})

// YouTube audio downloader
register({
    pattern: 'ytmp3',
    alias: ['yta', 'ytaudio'],
    desc: 'Download YouTube videos as audio',
    category: 'downloader',
    usage: 'ytmp3 [url/search]',
    react: '🎵',
    function: async (conn, mek, m, { args, reply, q }) => {
        if (!q) return reply('Please provide a YouTube URL or search term')
        
        try {
            await m.react('⏳')
            
            // Check if input is a URL or search term
            const isUrl = q.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
            
            let videoId
            let audioInfo
            
            if (isUrl) {
                // Extract video ID from URL
                videoId = isUrl[1]
                
                // Get audio info
                const infoUrl = `https://api.lolhuman.xyz/api/ytaudio?apikey=GataDios&url=https://www.youtube.com/watch?v=${videoId}`
                const infoResponse = await axios.get(infoUrl)
                
                if (!infoResponse.data || infoResponse.data.status !== 200) {
                    throw new Error('Failed to fetch YouTube audio data')
                }
                
                audioInfo = infoResponse.data.result
            } else {
                // Search YouTube
                const searchUrl = `https://api.lolhuman.xyz/api/ytsearch?apikey=GataDios&query=${encodeURIComponent(q)}`
                const searchResponse = await axios.get(searchUrl)
                
                if (!searchResponse.data || searchResponse.data.status !== 200 || !searchResponse.data.result || searchResponse.data.result.length === 0) {
                    throw new Error('No YouTube videos found for the search query')
                }
                
                // Use the first result
                const firstResult = searchResponse.data.result[0]
                videoId = firstResult.videoId
                
                // Get audio info
                const infoUrl = `https://api.lolhuman.xyz/api/ytaudio?apikey=GataDios&url=https://www.youtube.com/watch?v=${videoId}`
                const infoResponse = await axios.get(infoUrl)
                
                if (!infoResponse.data || infoResponse.data.status !== 200) {
                    throw new Error('Failed to fetch YouTube audio data')
                }
                
                audioInfo = infoResponse.data.result
            }
            
            // Create caption
            const caption = `*YouTube Audio Downloader*\n\n🎵 *Title:* ${audioInfo.title}\n👤 *Channel:* ${audioInfo.uploader}\n⏱️ *Duration:* ${audioInfo.duration}\n👁️ *Views:* ${audioInfo.view}\n📅 *Published:* ${audioInfo.published}\n\n_Downloaded by HYPER-MD Bot_`
            
            // Send thumbnail and info first
            await conn.sendMessage(m.chat, {
                image: { url: audioInfo.thumbnail },
                caption: caption
            }, { quoted: mek })
            
            // Send audio file
            await conn.sendMessage(m.chat, {
                audio: { url: audioInfo.link.link },
                mimetype: 'audio/mp4',
                fileName: `${audioInfo.title}.mp3`
            }, { quoted: mek })
            
            m.react('✅')
        } catch (error) {
            console.error('Error in YouTube audio command:', error)
            m.react('❌')
            reply(`Error downloading YouTube audio: ${error.message}`)
        }
    }
})

// Instagram downloader
register({
    pattern: 'instagram',
    alias: ['ig', 'igdl'],
    desc: 'Download Instagram posts/reels/stories',
    category: 'downloader',
    usage: 'instagram [url]',
    react: '📷',
    function: async (conn, mek, m, { args, reply, q }) => {
        if (!q) return reply('Please provide an Instagram URL')
        
        try {
            await m.react('⏳')
            
            // Extract Instagram URL from text
            const urlPattern = /(https?:\/\/[^\s]+instagram[^\s]+)/gi
            const matches = q.match(urlPattern)
            
            if (!matches || matches.length === 0) {
                m.react('❌')
                return reply('Invalid Instagram URL. Please provide a valid Instagram link.')
            }
            
            const url = matches[0]
            
            // Use Instagram API to get download links
            const apiUrl = `https://api.lolhuman.xyz/api/instagram?apikey=GataDios&url=${encodeURIComponent(url)}`
            
            const response = await axios.get(apiUrl)
            
            if (!response.data || response.data.status !== 200) {
                throw new Error('Failed to fetch Instagram data')
            }
            
            const result = response.data.result
            
            if (!result || result.length === 0) {
                throw new Error('No media found in the Instagram post')
            }
            
            // Create caption
            const caption = `*Instagram Downloader*\n\n_Downloaded by HYPER-MD Bot_`
            
            // Send each media
            for (let i = 0; i < result.length; i++) {
                const mediaUrl = result[i]
                
                // Determine media type based on URL
                if (mediaUrl.includes('.jpg') || mediaUrl.includes('.jpeg') || mediaUrl.includes('.png')) {
                    // Send as image
                    await conn.sendMessage(m.chat, {
                        image: { url: mediaUrl },
                        caption: i === 0 ? caption : '',
                    }, { quoted: mek })
                } else {
                    // Send as video
                    await conn.sendMessage(m.chat, {
                        video: { url: mediaUrl },
                        caption: i === 0 ? caption : '',
                    }, { quoted: mek })
                }
                
                // Add a small delay between sending media
                await new Promise(resolve => setTimeout(resolve, 1000))
            }
            
            m.react('✅')
        } catch (error) {
            console.error('Error in Instagram command:', error)
            m.react('❌')
            reply(`Error downloading from Instagram: ${error.message}`)
        }
    }
})

// Facebook downloader
register({
    pattern: 'facebook',
    alias: ['fb', 'fbdl'],
    desc: 'Download Facebook videos',
    category: 'downloader',
    usage: 'facebook [url]',
    react: '📹',
    function: async (conn, mek, m, { args, reply, q }) => {
        if (!q) return reply('Please provide a Facebook URL')
        
        try {
            await m.react('⏳')
            
            // Extract Facebook URL from text
            const urlPattern = /(https?:\/\/[^\s]+facebook[^\s]+|https?:\/\/[^\s]+fb\.[^\s]+)/gi
            const matches = q.match(urlPattern)
            
            if (!matches || matches.length === 0) {
                m.react('❌')
                return reply('Invalid Facebook URL. Please provide a valid Facebook link.')
            }
            
            const url = matches[0]
            
            // Use Facebook API to get download links
            const apiUrl = `https://api.lolhuman.xyz/api/facebook?apikey=GataDios&url=${encodeURIComponent(url)}`
            
            const response = await axios.get(apiUrl)
            
            if (!response.data || response.data.status !== 200) {
                throw new Error('Failed to fetch Facebook data')
            }
            
            const result = response.data.result
            
            // Create caption
            const caption = `*Facebook Downloader*\n\n_Downloaded by HYPER-MD Bot_`
            
            // Send video
            await conn.sendMessage(m.chat, {
                video: { url: result },
                caption: caption,
            }, { quoted: mek })
            
            m.react('✅')
        } catch (error) {
            console.error('Error in Facebook command:', error)
            m.react('❌')
            reply(`Error downloading from Facebook: ${error.message}`)
        }
    }
})

// Twitter/X downloader
register({
    pattern: 'twitter',
    alias: ['tw', 'x'],
    desc: 'Download Twitter/X posts',
    category: 'downloader',
    usage: 'twitter [url]',
    react: '🐦',
    function: async (conn, mek, m, { args, reply, q }) => {
        if (!q) return reply('Please provide a Twitter/X URL')
        
        try {
            await m.react('⏳')
            
            // Extract Twitter URL from text
            const urlPattern = /(https?:\/\/[^\s]+twitter[^\s]+|https?:\/\/[^\s]+x\.com[^\s]+)/gi
            const matches = q.match(urlPattern)
            
            if (!matches || matches.length === 0) {
                m.react('❌')
                return reply('Invalid Twitter/X URL. Please provide a valid Twitter/X link.')
            }
            
            const url = matches[0]
            
            // Use Twitter API to get download links
            const apiUrl = `https://api.lolhuman.xyz/api/twitter?apikey=GataDios&url=${encodeURIComponent(url)}`
            
            const response = await axios.get(apiUrl)
            
            if (!response.data || response.data.status !== 200) {
                throw new Error('Failed to fetch Twitter/X data')
            }
            
            const result = response.data.result
            
            // Create caption
            const caption = `*Twitter/X Downloader*\n\n👤 *Author:* ${result.author.name} (@${result.author.screen_name})\n📝 *Description:* ${result.text}\n❤️ *Likes:* ${result.likes}\n🔄 *Retweets:* ${result.retweets}\n\n_Downloaded by HYPER-MD Bot_`
            
            // Send media
            if (result.media.length > 0) {
                for (let i = 0; i < result.media.length; i++) {
                    const media = result.media[i]
                    
                    if (media.type === 'photo') {
                        // Send as image
                        await conn.sendMessage(m.chat, {
                            image: { url: media.url },
                            caption: i === 0 ? caption : '',
                        }, { quoted: mek })
                    } else if (media.type === 'video') {
                        // Send as video
                        await conn.sendMessage(m.chat, {
                            video: { url: media.url },
                            caption: i === 0 ? caption : '',
                        }, { quoted: mek })
                    }
                    
                    // Add a small delay between sending media
                    await new Promise(resolve => setTimeout(resolve, 1000))
                }
            } else {
                // No media, just send text
                reply(caption)
            }
            
            m.react('✅')
        } catch (error) {
            console.error('Error in Twitter command:', error)
            m.react('❌')
            reply(`Error downloading from Twitter/X: ${error.message}`)
        }
    }
})

// Register the plugin name in the commands list
register({
    pattern: 'plugin:downloader',
    desc: 'Social media downloaders plugin',
    type: 'plugin',
    function: () => {} // No action needed
})

module.exports = {}
