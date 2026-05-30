const { EmbedBuilder } = require('discord.js');

async function handleWelcome(member) {
    try {
        // Get the welcome channel ID from environment variables
        const welcomeChannelId = process.env.WELCOME_CHANNEL_ID;
        if (!welcomeChannelId) return; // If you don't set this up, the bot just ignores the event

        // Fetch the channel where we want to send the message
        const channel = await member.guild.channels.fetch(welcomeChannelId);
        if (!channel) return;

        // Create the Blaugrana Welcome Embed
        const embed = new EmbedBuilder()
            .setColor('#A50044') // Official Blaugrana Carmine Red
            .setTitle(`🔴🔵 Welcome to FCB Guwahati!`)
            .setDescription(`Visca el Barça! Welcome to the official FCB Guwahati fan club server, <@${member.id}>!\n\nMake sure to read the rules, pick your roles, and introduce yourself in the chat. We're thrilled to have another Culer in the family!`)
            .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 256 })) // Puts the user's profile picture in the corner
            .setImage('https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Camp_Nou_-_FC_Barcelona_Stadium.jpg/800px-Camp_Nou_-_FC_Barcelona_Stadium.jpg') // Epic Camp Nou banner
            .setFooter({ text: `You are member #${member.guild.memberCount} • FCB Guwahati` })
            .setTimestamp();

        // Send a message that actually tags the user, followed by the rich embed
        await channel.send({ content: `Hey <@${member.id}>! 🎉`, embeds: [embed] });

    } catch (error) {
        console.error('⚠️ Error in welcome system:', error);
    }
}

module.exports = { handleWelcome };