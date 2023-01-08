const config = require("../../config.json");
const messageUser = require("../models/messageUser");
const messageGuild = require("../models/messageGuild");
const guildChannel = require("../models/messageGuildChannel");
const userChannel = require("../models/messageUserChannel");
const { MessageEmbed } = require("discord.js");
const coin = require("../models/coin");
const client = global.client;
const nums = new Map();

module.exports = async message => {
    if (message.author.bot || !message.guild || message.content.startsWith(config.bot.prefix)) return;
    if (config.coin.stafs.some(x => message.member.roles.cache.has(x))) {
        const num = nums.get(message.author.id);
        if (num && (num % config.coin.messageCount) === 0) {
            nums.set(message.author.id, num + 1);
            await coin.findOneAndUpdate({ guildID: message.guild.id, userID: message.author.id }, { $inc: { coin: config.coin.messageCoin } }, { upsert: true });
            const coinData = await coin.findOne({ guildID: message.guild.id, userID: message.author.id });
            if (coinData && client.ranks.some(x => coinData.coin === x.coin)) {
                let newRank = client.ranks.filter(x => coinData.coin >= x.coin);
                newRank = newRank[newRank.length - 1];
                const oldRank = client.ranks[client.ranks.indexOf(newRank) - 1];
                message.member.roles.add(newRank.role);
                if (oldRank && Array.isArray(oldRank.role) && oldRank.role.some(x => message.member.roles.cache.has(x)) || oldRank && !Array.isArray(oldRank.role) && message.member.roles.cache.has(oldRank.role)) message.member.roles.remove(oldRank.role);
                const embed = new MessageEmbed().setColor("GREEN");
                message.guild.channels.cache.get(config.channels.ranklog).send(embed.setDescription(`${message.member.toString()} üyesi **${coinData.coin}** coin hedefine ulaştı ve ${Array.isArray(newRank.role) ? newRank.role.map(x => `<@&${x}>`).join(", ") : `<@&${newRank.role}>`} rolü verildi!`));
            }
        } else nums.set(message.author.id, num ? num + 1 : 1);
    }

    await messageUser.findOneAndUpdate({ guildID: message.guild.id, userID: message.author.id }, { $inc: { topStat: 1, dailyStat: 1, weeklyStat: 1, twoWeeklyStat: 1 } }, { upsert: true });
    await messageGuild.findOneAndUpdate({ guildID: message.guild.id }, { $inc: { topStat: 1, dailyStat: 1, weeklyStat: 1, twoWeeklyStat: 1 } }, { upsert: true });
    await guildChannel.findOneAndUpdate({ guildID: message.guild.id, channelID: message.channel.id }, { $inc: { channelData: 1 } }, { upsert: true });
    await userChannel.findOneAndUpdate({ guildID: message.guild.id, userID: message.author.id, channelID: message.channel.id }, { $inc: { channelData: 1 } }, { upsert: true });
}

module.exports.conf = {
    name: "message"
}