const Parser = require('rss-parser');
const { EmbedBuilder } = require('discord.js');
const { isPosted, markAsPosted } = require('../utils/postedNews');

// Initialize RSS Parser and tell it to look for images
const parser = new Parser({
    customFields: {
        item: ['media:content', 'enclosure']
    }
});

// Updated with reliable and active feeds
const RSS_FEEDS = [
    { name: 'Everything Barca', url: 'https://everythingbarca.com/feed/' },
    { name: 'Barca Blaugranes', url: 'https://www.barcablaugranes.com/rss/index.xml' }
];

async function fetchAndPostNews(client, channelId) {
    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel) {
            console.error('❌ Channel not found! Check your CHANNEL_ID in the .env file.');
            return;
        }

        // Check every feed one by one
        for (const feed of RSS_FEEDS) {
            try {
                const parsedFeed = await parser.parseURL(feed.url);

                // We only check the 3 most recent articles per feed to avoid spamming
                const latestItems = parsedFeed.items.slice(0, 3);
                
                // Reverse the array so the oldest of the 3 posts first, keeping chronological order
                for (const item of latestItems.reverse()) {
                    const articleUrl = item.link;

                    // Skip this article if we've already posted it
                    if (isPosted(articleUrl)) continue;

                    // Try to find a thumbnail image
                    let thumbnailUrl = null;
                    if (item.enclosure && item.enclosure.url) {
                        thumbnailUrl = item.enclosure.url;
                    } else if (item['media:content'] && item['media:content'].$) {
                        thumbnailUrl = item['media:content'].$.url;
                    }

                    // Build a beautiful Blaugrana embed
                    const embed = new EmbedBuilder()
                        .setColor('#A50044') // Official Blaugrana Carmine Red
                        .setTitle(item.title ? item.title.substring(0, 256) : 'New FCB Article')
                        .setURL(articleUrl)
                        .setDescription(
                            item.contentSnippet 
                                ? `${item.contentSnippet.substring(0, 200)}...\n\n**[Read More](${articleUrl})**` 
                                : `**[Click here to read the full article](${articleUrl})**`
                        )
                        .setAuthor({ name: feed.name })
                        .setFooter({ text: 'FCB Guwahati News Bot' })
                        .setTimestamp(new Date(item.pubDate || Date.now()));

                    if (thumbnailUrl) {
                        embed.setThumbnail(thumbnailUrl);
                    }

                    // Send the message to the Discord channel
                    await channel.send({ embeds: [embed] });
                    
                    // Mark as posted so it's never sent again
                    markAsPosted(articleUrl);
                    
                    // Wait 2 seconds before posting the next one to avoid Discord rate limits
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            } catch (error) {
                console.error(`⚠️ Error fetching feed ${feed.name}:`, error.message);
                // Catching the error here ensures that if one feed fails, the others still process
            }
        }
    } catch (error) {
        console.error('❌ Error in fetchAndPostNews:', error);
    }
}

module.exports = { fetchAndPostNews };