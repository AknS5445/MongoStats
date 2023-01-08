const moment = require("moment");
require("moment-duration-format");
const messageGuild = require("../models/messageGuild");
const messageGuildChannel = require("../models/messageGuildChannel");
const voiceGuild = require("../models/voiceGuild");
const voiceGuildChannel = require("../models/voiceGuildChannel");
const messageUser = require("../models/messageUser");
const voiceUser = require("../models/voiceUser");
const coin = require("../models/coin");

module.exports = {
    aliases: [],
    name: "top",
    help: "top",
    execute: async (client, message, args, embed, author, channel, guild) => {
        const messageChannelData = await messageGuildChannel.find({ guildID: guild.id }).sort({ channelData: -1 });
        const voiceChannelData = await voiceGuildChannel.find({ guildID: guild.id }).sort({ channelData: -1 });
        const messageUsersData = await messageUser.find({ guildID: guild.id }).sort({ topStat: -1 });
        const voiceUsersData = await voiceUser.find({ guildID: guild.id }).sort({ topStat: -1 });
        const messageGuildData = await messageGuild.findOne({ guildID: guild.id });
        const voiceGuildData = await voiceGuild.findOne({ guildID: guild.id });
        const coinData = await coin.find({ guildID: guild.id }).sort({ coin: -1 });

        let coinSum = 0;

        const messageChannels = messageChannelData.splice(0, 5).map((x, index) => `\`${index + 1}.\` <#${x.channelID}>: \`${Number(x.channelData).toLocaleString()} mesaj\``).join(`\n`);
        const voiceChannels = voiceChannelData.splice(0, 5).map((x, index) => `\`${index + 1}.\` <#${x.channelID}>: \`${moment.duration(x.channelData).format("H [saat], m [dakika] s [saniye]")}\``).join(`\n`);
        const messageUsers = messageUsersData.splice(0, 5).map((x, index) => `\`${index + 1}.\` <@${x.userID}>: \`${Number(x.topStat).toLocaleString()} mesaj\``).join(`\n`);
        const voiceUsers = voiceUsersData.splice(0, 5).map((x, index) => `\`${index + 1}.\` <@${x.userID}>: \`${moment.duration(x.topStat).format("H [saat], m [dakika] s [saniye]")}\``).join(`\n`);
        const coinUsers = coinData.splice(0, 5).map((x, index) => {
            coinSum += x.coin;
            return `\`${index + 1}.\` <@${x.userID}>: \`${Number(x.coin).toLocaleString()} coin\``
        }).join(`\n`);

        embed.setAuthor(guild.name, guild.iconURL({ dynamic: true, size: 2048 }))
        embed.setThumbnail(guild.iconURL({ dynamic: true, size: 2048 }))
        channel.send(embed.setDescription(`
    ${guild.name} sunucusunun toplam istatistikleri;
    **───────────────**
    
    **➥ Ses Bilgileri: (\`Toplam ${moment.duration(voiceGuildData ? voiceGuildData.topStat : 0).format("H [saat], m [dakika] s [saniye]")}\`)**
    ${voiceUsers.length > 0 ? voiceUsers : "Herhangi bir istatistik bulunmuyor."}
    
    **➥ Ses Kanal Bilgileri:**
    ${voiceChannels.length > 0 ? voiceChannels : "Herhangi bir istatistik bulunmuyor."}
    
    **───────────────**
    
    **➥ Mesaj Bilgileri: (\`Toplam ${Number(messageGuildData ? messageGuildData.topStat : 0).toLocaleString()} mesaj\`)**
    ${messageUsers.length > 0 ? messageUsers : "Herhangi bir istatistik bulunmuyor."}
    
    **➥ Mesaj Kanal Bilgileri:**
    ${messageChannels.length > 0 ? messageChannels : "Herhangi bir istatistik bulunmuyor."}

    **───────────────**

    **➥ Coin Bilgileri: \`(Toplam ${coinSum})\`**
    ${coinUsers.length > 0 ? coinUsers : "Herhangi bir istatistik bulunmuyor."}
    `))
    }
};