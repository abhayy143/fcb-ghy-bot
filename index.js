require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const express = require('express');
const { fetchAndPostNews } = require('./news/fetchNews');

// ==========================================
// DUMMY WEB SERVER TO KEEP RENDER AWAKE
// ==========================================
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Visca el Barça! The FCB Guwahati bot is alive and running.');
});

app.listen(PORT, () => {
    console.log(`🌐 Web server running on port ${PORT}`);
});
// ==========================================

// Create the Discord Client
const client = new Client({
    intents: [GatewayIntentBits.Guilds] 
});

// Event: When the bot successfully logs in
client.once('ready', () => {
    console.log(`✅ Bot is online as ${client.user.tag}`);
    
    const channelId = process.env.CHANNEL_ID;
    
    // 1. Run the fetcher immediately on startup
    console.log('Fetching initial news...');
    fetchAndPostNews(client, channelId);

    // 2. Schedule the fetcher to run every 15 minutes
    cron.schedule('*/15 * * * *', () => {
        console.log('Running 15-minute scheduled news fetch...');
        fetchAndPostNews(client, channelId);
    });
});

// Log into Discord
client.login(process.env.DISCORD_TOKEN);