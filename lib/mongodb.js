
const mongoose = require('mongoose')
const config = require('../config')

/**
 * Connect to MongoDB
 * @returns {Promise} MongoDB connection
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(config.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        
        console.log(`MongoDB Connected: ${conn.connection.host}`)
        return conn
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error.message}`)
        // Don't exit process, allow fallback to config.js values
        return null
    }
}

// Define User Schema
const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    phone: String,
    isAdmin: {
        type: Boolean,
        default: false
    },
    isPremium: {
        type: Boolean,
        default: false
    },
    premiumUntil: {
        type: Date,
        default: null
    },
    warns: {
        type: Number,
        default: 0
    },
    bannedReason: String,
    isBanned: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Define Group Schema
const groupSchema = new mongoose.Schema({
    groupId: {
        type: String,
        required: true,
        unique: true
    },
    name: String,
    description: String,
    antilink: {
        type: Boolean,
        default: false
    },
    antispam: {
        type: Boolean,
        default: false
    },
    welcome: {
        type: Boolean,
        default: true
    },
    goodbye: {
        type: Boolean,
        default: true
    },
    nsfw: {
        type: Boolean,
        default: false
    },
    isBanned: {
        type: Boolean,
        default: false
    },
    bannedReason: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
})

// Create models only if they don't exist already
const User = mongoose.models.User || mongoose.model('User', userSchema)
const Group = mongoose.models.Group || mongoose.model('Group', groupSchema)

module.exports = connectDB
module.exports.User = User
module.exports.Group = Group
