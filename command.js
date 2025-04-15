/**
 * HYPER-MD WhatsApp Bot Command Handler
 */

// Store for all registered commands
const commands = []

/**
 * Register a new command
 * @param {object} commandOptions Command options
 * @returns {boolean} Success or failure
 */
const register = (commandOptions) => {
    try {
        // Check if required fields are provided
        if (!commandOptions.pattern && !commandOptions.on) {
            console.error('Command must have either pattern or on property')
            return false
        }
        
        if (!commandOptions.function || typeof commandOptions.function !== 'function') {
            console.error('Command must have a function property')
            return false
        }
        
        // Check if command already exists
        const existingCommand = commands.find(cmd => 
            cmd.pattern === commandOptions.pattern || 
            (cmd.alias && cmd.alias.some(alias => commandOptions.alias && commandOptions.alias.includes(alias)))
        )
        
        if (existingCommand) {
            // Override existing command
            const index = commands.indexOf(existingCommand)
            commands[index] = commandOptions
            return true
        }
        
        // Add new command
        commands.push(commandOptions)
        return true
    } catch (error) {
        console.error('Error registering command:', error)
        return false
    }
}

/**
 * Execute a command by name
 * @param {string} commandName Command name/pattern
 * @param {object} conn Baileys connection instance
 * @param {object} m Message object
 * @param {object} args Command arguments and context
 * @returns {any} Command result
 */
const execute = (commandName, conn, m, args = {}) => {
    try {
        const command = commands.find(cmd => cmd.pattern === commandName || (cmd.alias && cmd.alias.includes(commandName)))
        
        if (!command) {
            return null
        }
        
        return command.function(conn, m, args)
    } catch (error) {
        console.error(`Error executing command ${commandName}:`, error)
        return null
    }
}

module.exports = {
    commands,
    register,
    execute
}
