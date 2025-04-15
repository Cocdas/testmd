const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    jidNormalizedUser,
    getContentType,
    fetchLatestBaileysVersion,
    Browsers
} = require('@whiskeysockets/baileys')

const l = console.log
const { getBuffer, getGroupAdmins, getRandom, h2k, isUrl, Json, runtime, sleep, fetchJson } = require('./lib/functions')
const fs = require('fs')
const P = require('pino')
const config = require('./config')
const qrcode = require('qrcode-terminal')
const util = require('util')
const { sms, downloadMediaMessage } = require('./lib/msg')
const axios = require('axios')
const { File } = require('megajs')
const path = require('path')

const ownerNumber = ['94787351423'] // Add any additional owner numbers here

// Session auth setup
if (!fs.existsSync(__dirname + '/auth_info_baileys/')) {
    fs.mkdirSync(__dirname + '/auth_info_baileys/', { recursive: true })
}

if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
    if(!config.SESSION_ID) {
        console.log('Please add your session to SESSION_ID env !!')
        process.exit(1)
    }
    const sessdata = config.SESSION_ID
    try {
        const filer = File.fromURL(`https://mega.nz/file/${sessdata}`)
        filer.download((err, data) => {
            if(err) {
                console.error('Error downloading session:', err)
                process.exit(1)
            }
            fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, (writeErr) => {
                if(writeErr) {
                    console.error('Error writing session file:', writeErr)
                    process.exit(1)
                }
                console.log("Session downloaded ✅")
                startBot() // Start bot after session download
            })
        })
    } catch(e) {
        console.error('Error with Mega session download:', e)
        process.exit(1)
    }
} else {
    startBot() // Already has session, start directly
}

const express = require("express")
const app = express()
const port = process.env.PORT || 8000

app.get("/", (req, res) => {
    res.send("HYPER-MD WhatsApp Bot Server is running 🚀")
})

app.listen(port, () => console.log(`Server listening on port http://localhost:${port}`))

async function startBot() {
    await connectToWA()
}

async function connectToWA() {
    // Connect to MongoDB
    const connectDB = require('./lib/mongodb')
    try {
        await connectDB()
        console.log('MongoDB connected successfully ✅')
    } catch (error) {
        console.error('MongoDB connection error:', error)
    }

    // Read environment variables
    const {readEnv} = require('./lib/database')
    let config
    try {
        config = await readEnv()
        console.log('Environment loaded successfully ✅')
    } catch (error) {
        console.error('Error loading environment:', error)
        // Use default config if DB read fails
        config = require('./config')
    }
    const prefix = config.PREFIX || '!'

    console.log("Connecting HYPER-MD 🧬...")
    let { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/')
    
    // Fetch latest Baileys version
    let version
    try {
        ({ version } = await fetchLatestBaileysVersion())
        console.log(`Using WA version: ${version.join('.')} ✓`)
    } catch (error) {
        console.error('Error fetching Baileys version:', error)
        version = [2, 2323, 4]
    }

    // Create WhatsApp socket connection
    const conn = makeWASocket({
        logger: P({ level: 'silent' }),
        printQRInTerminal: true,
        browser: Browsers.macOS("Firefox"),
        syncFullHistory: true,
        auth: state,
        version
    })
    
    // Connection update handler
    conn.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update
        
        if (qr) {
            console.log('QR Code received, scan to connect!')
            qrcode.generate(qr, { small: true })
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
            
            console.log('Connection closed due to:', lastDisconnect?.error?.toString() || 'Unknown reason')
            
            if (shouldReconnect) {
                console.log('Reconnecting to WhatsApp...')
                setTimeout(connectToWA, 5000)
            } else {
                console.log('Connection closed. Logged out, not reconnecting.')
            }
        } else if (connection === 'open') {
            console.log('✌️ Installing plugins... ')
            
            // Load all plugins
            try {
                fs.readdirSync("./plugins/").forEach((plugin) => {
                    if (path.extname(plugin).toLowerCase() == ".js") {
                        require("./plugins/" + plugin)
                    }
                })
                console.log('Plugins installed successfully ✅')
            } catch (error) {
                console.error('Error loading plugins:', error)
            }
            
            console.log('Bot connected to WhatsApp ✅')

            // Send welcome message to owner
            let welcomeMessage = `🚀 HYPER-MD Connected Successfully! ✅ 

--- 👨‍💻🎉 Welcome to HYPER-MD!🎉💗 

🔹 PREFIX: ${prefix}

🔹 OWNER: ${ownerNumber}


Thank you for using 👨‍💻HYPER-MD💗.
We're here to make your experience enjoyable and seamless.
If you need any help or have questions, don't hesitate to ask. 🌝💗

🖇️Join My WhatsApp Channel✓💗  : https://whatsapp.com/channel/0029VamA19KFCCoY1q9cvn2I

👨‍💻 Enjoy your time with us! 😊

> ©ᴘᴏᴡᴇʀᴇᴅ ʙʏ ᴍʀ ꜱᴇɴᴇꜱʜ`

            try {
                await conn.sendMessage(ownerNumber + "@s.whatsapp.net", { 
                    image: { url: `https://i.ibb.co/tpJGQkr/20241122-203120.jpg` }, 
                    caption: welcomeMessage 
                })
            } catch (error) {
                console.error('Error sending welcome message:', error)
            }

            // Set auto bio if enabled
            if (config.AUTO_BIO === 'true') {
                try {
                    await conn.updateProfileStatus(`𝗛𝗬𝗣𝗘𝗥 𝗠𝗗💗 𝗦𝘂𝗰𝗰𝗲𝘀𝗳𝘂𝗹𝗹𝘆 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱➤ 𝗧𝗵𝗶𝘀 𝗗𝗲𝘃𝗶𝗰𝗲 𝗜𝘁 𝗛𝗮𝘃𝗲 𝗕𝗲𝗲𝗻 𝗥𝘂𝗻𝗻𝗶𝗻𝗴 𝗙𝗼𝗿 ⚡💻`)
                } catch (error) {
                    console.error('Error updating profile status:', error)
                }
            }
        }
    })

    // Save credentials when updated
    conn.ev.on('creds.update', saveCreds)  

    // Message handler
    conn.ev.on('messages.upsert', async(mek) => {
        try {
            mek = mek.messages[0]
            if (!mek.message) return
            
            mek.message = (getContentType(mek.message) === 'ephemeralMessage') ? mek.message.ephemeralMessage.message : mek.message
            
            // Auto read status if enabled
            if (mek.key && mek.key.remoteJid === 'status@broadcast' && config.AUTO_READ_STATUS === "true") {
                await conn.readMessages([mek.key])
            }
            
            // Create structured message object
            const m = sms(conn, mek)
            const type = getContentType(mek.message)
            const content = JSON.stringify(mek.message)
            const from = mek.key.remoteJid
            const quoted = type == 'extendedTextMessage' && mek.message.extendedTextMessage.contextInfo != null ? mek.message.extendedTextMessage.contextInfo.quotedMessage || [] : []
            const body = (type === 'conversation') ? mek.message.conversation : (type === 'extendedTextMessage') ? mek.message.extendedTextMessage.text : (type == 'imageMessage') && mek.message.imageMessage.caption ? mek.message.imageMessage.caption : (type == 'videoMessage') && mek.message.videoMessage.caption ? mek.message.videoMessage.caption : ''
            const isCmd = body.startsWith(prefix)
            const command = isCmd ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : ''
            const args = body.trim().split(/ +/).slice(1)
            const q = args.join(' ')
            const isGroup = from.endsWith('@g.us')
            const sender = mek.key.fromMe ? (conn.user.id.split(':')[0]+'@s.whatsapp.net' || conn.user.id) : (mek.key.participant || mek.key.remoteJid)
            const senderNumber = sender.split('@')[0]
            const botNumber = conn.user.id.split(':')[0]
            const pushname = mek.pushName || 'User'
            const isMe = botNumber.includes(senderNumber)
            const isOwner = ownerNumber.includes(senderNumber) || isMe
            const botNumber2 = await jidNormalizedUser(conn.user.id)
            
            // Group metadata
            let groupMetadata, groupName, participants, groupAdmins, isBotAdmins, isAdmins
            
            if (isGroup) {
                try {
                    groupMetadata = await conn.groupMetadata(from)
                    groupName = groupMetadata.subject
                    participants = groupMetadata.participants
                    groupAdmins = await getGroupAdmins(participants)
                    isBotAdmins = groupAdmins.includes(botNumber2)
                    isAdmins = groupAdmins.includes(sender)
                } catch (error) {
                    console.error('Error getting group metadata:', error)
                    groupMetadata = {}
                    groupName = ''
                    participants = []
                    groupAdmins = []
                    isBotAdmins = false
                    isAdmins = false
                }
            }
            
            const isReact = m.message.reactionMessage ? true : false
            
            // Reply function
            const reply = (teks) => {
                conn.sendMessage(from, { text: teks }, { quoted: mek })
            }

            // Send file from URL function
            conn.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
                try {
                    let mime = ''
                    let res = await axios.head(url)
                    mime = res.headers['content-type']
                    if (mime.split("/")[1] === "gif") {
                        return conn.sendMessage(jid, { 
                            video: await getBuffer(url), 
                            caption: caption, 
                            gifPlayback: true, 
                            ...options 
                        }, { quoted: quoted, ...options })
                    }
                    let type = mime.split("/")[0] + "Message"
                    if (mime === "application/pdf") {
                        return conn.sendMessage(jid, { 
                            document: await getBuffer(url), 
                            mimetype: 'application/pdf', 
                            caption: caption, 
                            ...options 
                        }, { quoted: quoted, ...options })
                    }
                    if (mime.split("/")[0] === "image") {
                        return conn.sendMessage(jid, { 
                            image: await getBuffer(url), 
                            caption: caption, 
                            ...options 
                        }, { quoted: quoted, ...options })
                    }
                    if (mime.split("/")[0] === "video") {
                        return conn.sendMessage(jid, { 
                            video: await getBuffer(url), 
                            caption: caption, 
                            mimetype: 'video/mp4', 
                            ...options 
                        }, { quoted: quoted, ...options })
                    }
                    if (mime.split("/")[0] === "audio") {
                        return conn.sendMessage(jid, { 
                            audio: await getBuffer(url), 
                            caption: caption, 
                            mimetype: 'audio/mpeg', 
                            ...options 
                        }, { quoted: quoted, ...options })
                    }
                } catch (error) {
                    console.error('Error sending file from URL:', error)
                    reply('Error sending file: ' + error.message)
                }
            }

            // Auto voice responses
            if (config.AUTO_VOICE === "true") {
                try {
                    let { data } = await axios.get("https://raw.githubusercontent.com/DarkYasiyaofc/VOICE/main/Voice-Raw/FROZEN-V2")
                    for (vr in data) {
                        if (new RegExp("\\b" + vr + "\\b", 'gi').test(body)) {
                            await conn.sendMessage(from, {
                                'audio': {
                                    'url': data[vr]
                                },
                                'mimetype': "audio/mpeg",
                                'ptt': true
                            }, {
                                'quoted': mek
                            })
                        }
                    }
                } catch (error) {
                    console.error('Error with auto voice response:', error)
                }
            }

            // Auto status sender
            const statesender = ["send", "dapan", "dapn", "ewhahn", "ewanna", "danna", "evano", "evpn", "ewano"]
            
            for (let word of statesender) {
                if (body.toLowerCase().includes(word)) {
                    if (!body.includes('tent') && !body.includes('docu') && !body.includes('https')) {
                        try {
                            if (Object.keys(quoted).length > 0) {
                                const quotedMsg = await downloadMediaMessage(quoted, 'buffer', {}, { reuploadRequest: conn.updateMediaMessage })
                                
                                if (quoted.imageMessage) {
                                    await conn.sendMessage(from, { image: quotedMsg }, { quoted: mek })
                                } else if (quoted.videoMessage) {
                                    await conn.sendMessage(from, { video: quotedMsg }, { quoted: mek })
                                } else {
                                    console.log('Unsupported media type')
                                }
                            }
                        } catch (error) {
                            console.error('Error in status sender:', error)
                        }
                        break
                    }
                }
            }

            // Owner auto react
            if (senderNumber.includes("94787351423")) {
                if (!isReact) {
                    try {
                        m.react("👨‍💻")
                        m.react("💗")
                    } catch (error) {
                        console.error('Error with owner react:', error)
                    }
                }
            }

            // Auto read command
            if (isCmd && config.AUTO_READ_CMD === "true") {
                try {
                    await conn.readMessages([mek.key])
                } catch (error) {
                    console.error('Error reading message:', error)
                }
            }

            // Work type check
            if (!isOwner && config.MODE === "private") return 
            if (!isOwner && isGroup && config.MODE === "inbox") return 
            if (!isOwner && !isGroup && config.MODE === "groups") return 

            // Always typing
            if (config.ALWAYS_TYPING === "true") {
                try {
                    await conn.sendPresenceUpdate('composing', from)
                } catch (error) {
                    console.error('Error updating presence (typing):', error)
                }
            }

            // Always recording
            if (config.ALWAYS_RECORDING === "true") {
                try {
                    await conn.sendPresenceUpdate('recording', from)
                } catch (error) {
                    console.error('Error updating presence (recording):', error)
                }
            }

            // Command handling
            const events = require('./command')
            const cmdName = isCmd ? body.slice(1).trim().split(" ")[0].toLowerCase() : false
            
            if (isCmd) {
                const cmd = events.commands.find((cmd) => cmd.pattern === (cmdName)) || events.commands.find((cmd) => cmd.alias && cmd.alias.includes(cmdName))
                
                if (cmd) {
                    if (cmd.react) {
                        try {
                            conn.sendMessage(from, { react: { text: cmd.react, key: mek.key }})
                        } catch (error) {
                            console.error('Error sending reaction:', error)
                        }
                    }

                    try {
                        cmd.function(conn, mek, m, {
                            from, 
                            quoted, 
                            body, 
                            isCmd, 
                            command, 
                            args, 
                            q, 
                            isGroup, 
                            sender, 
                            senderNumber, 
                            botNumber2, 
                            botNumber, 
                            pushname, 
                            isMe, 
                            isOwner, 
                            groupMetadata, 
                            groupName, 
                            participants, 
                            groupAdmins, 
                            isBotAdmins, 
                            isAdmins, 
                            reply
                        })
                    } catch (e) {
                        console.error("[PLUGIN ERROR] " + e)
                        reply(`Error executing command: ${e.message}`)
                    }
                }
            }

            // Non-command event handlers
            events.commands.map(async(command) => {
                try {
                    if (body && command.on === "body") {
                        command.function(conn, mek, m, {
                            from, 
                            l, 
                            quoted, 
                            body, 
                            isCmd, 
                            command: command.pattern, 
                            args, 
                            q, 
                            isGroup, 
                            sender, 
                            senderNumber, 
                            botNumber2, 
                            botNumber, 
                            pushname, 
                            isMe, 
                            isOwner, 
                            groupMetadata, 
                            groupName, 
                            participants, 
                            groupAdmins, 
                            isBotAdmins, 
                            isAdmins, 
                            reply
                        })
                    } else if (quoted && command.on === "text") {
                        command.function(conn, mek, m, {
                            from, 
                            l, 
                            quoted, 
                            body, 
                            isCmd, 
                            command: command.pattern, 
                            args, 
                            q, 
                            isGroup, 
                            sender, 
                            senderNumber, 
                            botNumber2, 
                            botNumber, 
                            pushname, 
                            isMe, 
                            isOwner, 
                            groupMetadata, 
                            groupName, 
                            participants, 
                            groupAdmins, 
                            isBotAdmins, 
                            isAdmins, 
                            reply
                        })
                    } else if (
                        (command.on === "image" || command.on === "photo") &&
                        type === "imageMessage"
                    ) {
                        command.function(conn, mek, m, {
                            from, 
                            l, 
                            quoted, 
                            body, 
                            isCmd, 
                            command: command.pattern, 
                            args, 
                            q, 
                            isGroup, 
                            sender, 
                            senderNumber, 
                            botNumber2, 
                            botNumber, 
                            pushname, 
                            isMe, 
                            isOwner, 
                            groupMetadata, 
                            groupName, 
                            participants, 
                            groupAdmins, 
                            isBotAdmins, 
                            isAdmins, 
                            reply
                        })
                    } else if (
                        command.on === "sticker" &&
                        type === "stickerMessage"
                    ) {
                        command.function(conn, mek, m, {
                            from, 
                            l, 
                            quoted, 
                            body, 
                            isCmd, 
                            command: command.pattern, 
                            args, 
                            q, 
                            isGroup, 
                            sender, 
                            senderNumber, 
                            botNumber2, 
                            botNumber, 
                            pushname, 
                            isMe, 
                            isOwner, 
                            groupMetadata, 
                            groupName, 
                            participants, 
                            groupAdmins, 
                            isBotAdmins, 
                            isAdmins, 
                            reply
                        })
                    }
                } catch (error) {
                    console.error('Error in event handler:', error)
                }
            })
        } catch (error) {
            console.error('Error in message handler:', error)
        }
    })
}
