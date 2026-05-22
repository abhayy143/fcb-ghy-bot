require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const { fetchAndPostNews } = require('./news/fetchNews');

// Create the Discord Client (only requesting permission to view/send in guilds)
const client = new Client({
    intents: [GatewayIntentBits.Guilds] 
});

// Event: When the bot successfully logs in
client.once('ready', () => {
    console.log(`✅ Visca el Barça! Bot is online as ${client.user.tag}`);
    
    const channelId = process.env.CHANNEL_ID;
    
    // 1. Run the fetcher immediately on startup
    console.log('Fetching initial news...');
    fetchAndPostNews(client, channelId);

    // 2. Schedule the fetcher to run every 15 minutes
    // The cron syntax '*/15 * * * *' means "every 15 minutes"
    cron.schedule('*/15 * * * *', () => {
        console.log('Running 15-minute scheduled news fetch...');
        fetchAndPostNews(client, channelId);
    });
});

// Log into Discord
client.login(process.env.DISCORD_TOKEN);