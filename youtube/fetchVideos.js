const Parser = require('rss-parser');
const { isPosted, markAsPosted } = require('../utils/postedNews');

const parser = new Parser();

// This is the official hidden RSS feed for the FC Barcelona YouTube Channel
const YOUTUBE_RSS_URL = 'https://www.youtube.com/feeds/videos.xml?channel_id=UC14UlmYlSNiQCBe9Eookf_A';

async function fetchAndPostVideos(client, channelId) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            console.error('❌ Video channel not found!');
            return;
        }

        const parsedFeed = await parser.parseURL(YOUTUBE_RSS_URL);

        // We only check the 2 most recent videos to avoid spam
        const latestVideos = parsedFeed.items.slice(0, 2);
        
        for (const video of latestVideos.reverse()) {
            const videoUrl = video.link;

            // Skip if we've already posted it
            if (isPosted(videoUrl)) continue;

            // Create a simple, hype message. Discord will automatically turn the link into a playable video player!
            const message = `🎥 **New Video from FC Barcelona!**\n*${video.title}*\n\n${videoUrl}`;

            // Send to Discord
            await channel.send(message);
            
            // Mark as posted in our memory cache
            markAsPosted(videoUrl);
            
            // Wait 2 seconds before posting the next one
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    } catch (error) {
        console.error('⚠️ Error fetching YouTube videos:', error.message);
    }
}

module.exports = { fetchAndPostVideos };