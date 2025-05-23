const fs = require('fs').promises;
const path = require('path');

const USER_DATA_FILE = path.resolve(__dirname, '../../data/users.json');

// Ensure the data directory exists
const ensureDataDirectory = async () => {
    const dataDir = path.dirname(USER_DATA_FILE);
    try {
        await fs.access(dataDir);
    } catch {
        await fs.mkdir(dataDir, { recursive: true });
    }
}

// Initialize users file if it doesn't exist
const initializeUsersFile = async () => {
    try {
        await fs.access(USER_DATA_FILE);
    } catch {
        await fs.writeFile(USER_DATA_FILE, JSON.stringify({ users: {} }, null, 2));
    }
}

// Get all users
const getUsers = async () => {
    await ensureDataDirectory();
    await initializeUsersFile();
    const data = await fs.readFile(USER_DATA_FILE, 'utf8');
    return JSON.parse(data);
}

// Save users
const saveUsers = async (users) => {
    await ensureDataDirectory();
    await fs.writeFile(USER_DATA_FILE, JSON.stringify(users, null, 2));
}

// Connect wallet to user
const connectWallet = async (telegramId, telegramHandle, walletAddress) => {
    const users = await getUsers();
    users.users[telegramId] = {
        telegramHandle,
        walletAddress,
        connectedAt: new Date().toISOString()
    };
    await saveUsers(users);
    return users.users[telegramId];
}

// Get user's wallet
const getUserWallet = async (telegramId) => {
    const users = await getUsers();
    return users.users[telegramId]?.walletAddress;
}

// Get user's wallet by handle
const getUserWalletByHandle = async (handle) => {
    const users = await getUsers();
    for (const user of Object.values(users.users)) {
        if (user.telegramHandle === handle) {
            return user.walletAddress;
        }
    }
    return null;
}

// Disconnect wallet from user
const disconnectWallet = async (telegramId) => {
    const users = await getUsers();
    if (users.users[telegramId]) {
        delete users.users[telegramId];
        await saveUsers(users);
        return true;
    }
    return false;
}

module.exports = {
    connectWallet,
    getUserWallet,
    getUserWalletByHandle,
    disconnectWallet,
    getUsers
}; 