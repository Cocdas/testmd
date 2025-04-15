/**
 * HYPER-MD WhatsApp Bot Database Operations
 */

const mongoose = require('mongoose')
const { User, Group } = require('./mongodb')
const config = require('../config')

/**
 * Environment variables schema for bot configuration
 */
const envSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: String,
        required: true
    }
})

// Create model
const Environment = mongoose.models.Environment || mongoose.model('Environment', envSchema)

/**
 * Read environment variables from database
 * @returns {object} Configuration object
 */
const readEnv = async () => {
    try {
        // Check if DB is connected
        if (mongoose.connection.readyState !== 1) {
            console.log('Database not connected, using default config')
            return config
        }
        
        const envVars = await Environment.find({})
        if (!envVars || envVars.length === 0) {
            await initializeEnv()
            return config
        }
        
        // Convert to config object
        const envConfig = {}
        for (const env of envVars) {
            envConfig[env.key] = env.value
        }
        
        // Merge with default config (for any missing values)
        return { ...config, ...envConfig }
    } catch (error) {
        console.error('Error reading environment variables:', error)
        return config
    }
}

/**
 * Initialize environment variables in database
 */
const initializeEnv = async () => {
    try {
        // Check if DB is connected
        if (mongoose.connection.readyState !== 1) {
            console.log('Database not connected, skipping environment initialization')
            return
        }
        
        // Check if any env vars already exist
        const count = await Environment.countDocuments()
        if (count > 0) return
        
        // Insert default config values
        const entries = Object.entries(config)
        const envData = entries.map(([key, value]) => ({
            key,
            value: String(value)
        }))
        
        await Environment.insertMany(envData)
        console.log('Environment variables initialized in database')
    } catch (error) {
        console.error('Error initializing environment variables:', error)
    }
}

/**
 * Update environment variable
 * @param {string} key Key to update
 * @param {string} value New value
 * @returns {object} Updated environment variable
 */
const updateEnv = async (key, value) => {
    try {
        // Check if DB is connected
        if (mongoose.connection.readyState !== 1) {
            console.log('Database not connected, cannot update environment')
            return null
        }
        
        const updated = await Environment.findOneAndUpdate(
            { key },
            { value: String(value) },
            { new: true, upsert: true }
        )
        
        return updated
    } catch (error) {
        console.error(`Error updating environment variable ${key}:`, error)
        return null
    }
}

/**
 * Get user from database, create if not exists
 * @param {string} userId User ID
 * @param {string} name User name
 * @returns {object} User object
 */
const getUser = async (userId, name = '') => {
    try {
        // Check if DB is connected
        if (mongoose.connection.readyState !== 1) {
            return { userId, name, isAdmin: false, isPremium: false, warns: 0, isBanned: false }
        }
        
        let user = await User.findOne({ userId })
        
        if (!user && userId) {
            user = await User.create({
                userId,
                name: name || 'User',
                phone: userId.split('@')[0],
                isAdmin: config.OWNER_NUMBER === userId.split('@')[0]
            })
        }
        
        return user || { userId, name, isAdmin: false, isPremium: false, warns: 0, isBanned: false }
    } catch (error) {
        console.error('Error getting/creating user:', error)
        return { userId, name, isAdmin: false, isPremium: false, warns: 0, isBanned: false }
    }
}

/**
 * Get group from database, create if not exists
 * @param {string} groupId Group ID
 * @param {string} name Group name
 * @returns {object} Group object
 */
const getGroup = async (groupId, name = '') => {
    try {
        // Check if DB is connected
        if (mongoose.connection.readyState !== 1) {
            return { 
                groupId, 
                name, 
                antilink: config.ANTILINK === 'true', 
                antispam: config.ANTISPAM === 'true',
                welcome: true,
                goodbye: true,
                nsfw: false,
                isBanned: false
            }
        }
        
        let group = await Group.findOne({ groupId })
        
        if (!group && groupId) {
            group = await Group.create({
                groupId,
                name: name || 'Group',
                antilink: config.ANTILINK === 'true',
                antispam: config.ANTISPAM === 'true'
            })
        }
        
        return group || { 
            groupId, 
            name, 
            antilink: config.ANTILINK === 'true', 
            antispam: config.ANTISPAM === 'true',
            welcome: true,
            goodbye: true,
            nsfw: false,
            isBanned: false
        }
    } catch (error) {
        console.error('Error getting/creating group:', error)
        return { 
            groupId, 
            name, 
            antilink: config.ANTILINK === 'true', 
            antispam: config.ANTISPAM === 'true',
            welcome: true,
            goodbye: true,
            nsfw: false,
            isBanned: false
        }
    }
}

/**
 * Ban a user
 * @param {string} userId User ID
 * @param {string} reason Ban reason
 * @returns {boolean} Success or failure
 */
const banUser = async (userId, reason = 'No reason provided') => {
    try {
        // Check if DB is connected
        if (mongoose.connection.readyState !== 1) {
            return false
        }
        
        await User.findOneAndUpdate(
            { userId },
            { isBanned: true, bannedReason: reason, updatedAt: Date.now() },
            { upsert: true }
        )
        
        return true
    } catch (error) {
        console.error('Error banning user:', error)
        return false
    }
}

/**
 * Unban a user
 * @param {string} userId User ID
 * @returns {boolean} Success or failure
 */
const unbanUser = async (userId) => {
    try {
        // Check if DB is connected
        if (mongoose.connection.readyState !== 1) {
            return false
        }
        
        await User.findOneAndUpdate(
            { userId },
            { isBanned: false, bannedReason: null, updatedAt: Date.now() },
            { upsert: true }
        )
        
        return true
    } catch (error) {
        console.error('Error unbanning user:', error)
        return false
    }
}

/**
 * Add user warn
 * @param {string} userId User ID
 * @returns {number} New warn count
 */
const addWarn = async (userId) => {
    try {
        // Check if DB is connected
        if (mongoose.connection.readyState !== 1) {
            return 1
        }
        
        const user = await User.findOneAndUpdate(
            { userId },
            { $inc: { warns: 1 }, updatedAt: Date.now() },
            { new: true, upsert: true }
        )
        
        return user.warns
    } catch (error) {
        console.error('Error adding warn:', error)
        return 1
    }
}

/**
 * Reset user warns
 * @param {string} userId User ID
 * @returns {boolean} Success or failure
 */
const resetWarns = async (userId) => {
    try {
        // Check if DB is connected
        if (mongoose.connection.readyState !== 1) {
            return false
        }
        
        await User.findOneAndUpdate(
            { userId },
            { warns: 0, updatedAt: Date.now() },
            { upsert: true }
        )
        
        return true
    } catch (error) {
        console.error('Error resetting warns:', error)
        return false
    }
}

module.exports = {
    readEnv,
    updateEnv,
    initializeEnv,
    getUser,
    getGroup,
    banUser,
    unbanUser,
    addWarn,
    resetWarns
}
