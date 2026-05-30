require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const cron = require('node-cron');
const express = require('express');
const { fetchAndPostNews } = require('./news/fetchNews');
const { fetchAndPostVideos } = require('./youtube/fetchVideos');

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
    
    // Grab both channel IDs from the environment variables
    const newsChannelId = process.env.CHANNEL_ID;
    const youtubeChannelId = process.env.YOUTUBE_CHANNEL_ID;
    
    // 1. Run the fetchers immediately on startup
    console.log('Fetching initial news and videos...');
    fetchAndPostNews(client, newsChannelId);
    
    if (youtubeChannelId) {
        fetchAndPostVideos(client, youtubeChannelId);
    } else {
        console.error('⚠️ YOUTUBE_CHANNEL_ID is missing from your environment variables!');
    }

    // 2. Schedule the fetchers to run every 15 minutes
    cron.schedule('*/15 * * * *', () => {
        console.log('Running 15-minute scheduled news & video fetch...');
        fetchAndPostNews(client, newsChannelId);
        
        if (youtubeChannelId) {
            fetchAndPostVideos(client, youtubeChannelId);
        }
    });
});

// Log into Discord
client.login(process.env.DISCORD_TOKEN);