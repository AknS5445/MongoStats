const moment = require("moment");
require("moment-duration-format");
const messageUser = require("../models/messageUser");
const voiceUser = require("../models/voiceUser");
const coin = require("../models/coin");

module.exports = {
    name: "role",
    aliases: ["rol"],
    help: "rol [rol]",
    execute: async (client, message, args, embed, author, channel, guild) => {
        if (!message.member.hasPermission(8)) return;
        const role = message.mentions.roles.first() || guild.roles.cache.get(args[0]);
        if (!role) return channel.send(embed.setDescription("Bir rol belirtmelisin!"));
        else if (role.members.size === 0) return channel.send(embed.setDescription("Belirtilen rol hiçbir kullanıcıda bulunmamakta!"));

        const messageData = async (type) => {
            let data = await messageUser.find({ guildID: guild.id }).sort({ topStat: -1 });
            data = data.filter(x => guild.members.cache.has(x.userID) && guild.members.cache.get(x.userID).roles.cache.has(role.id));
            return data.length > 0 ? data.splice(0, 5).map((x, index) => `\`${index + 1}.\` <@${x.userID}> : \`${Number(x[type]).toLocaleString()} mesaj\``).join(`\n`) : "Herhangi bir istatistik bulunmuyor!";
        };

        const voiceData = async (type) => {
            let data = await voiceUser.find({ guildID: guild.id }).sort({ topStat: -1 });
            data = data.filter(x => guild.members.cache.has(x.userID) && guild.members.cache.get(x.userID).roles.cache.has(role.id));
            return data.length > 0 ? data.splice(0, 5).map((x, index) => `\`${index + 1}.\` <@${x.userID}> : \`${moment.duration(x[type]).format("H [saat], m [dakika] s [saniye]")}\``).join(`\n`) : "Herhangi bir istatistik bulunmuyor.";
        };

        const coinData = async () => {
            let data = await coin.find({ guildID: guild.id }).sort({ coin: -1 });
            data = data.filter(x => guild.members.cache.has(x.userID) && guild.members.cache.get(x.userID).roles.cache.has(role.id));
            return data.length > 0 ? data.splice(0, 5).map((x, index) => `\`${index + 1}.\` <@${x.userID}>: \`${Number(x.coin).toLocaleString()} coin\``).join(`\n`) : "Herhangi bir istatistik bulunmuyor.";
        };

        embed.setAuthor(guild.name, guild.iconURL({ dynamic: true, size: 2048 }))
        embed.setThumbnail(guild.iconURL({ dynamic: true, size: 2048 }))
        channel.send(embed.setDescription(`
    ${role.toString()} rolüne sahip kullanıcıların sunucumuzda ki istatistikleri;
    **───────────────**
    
    **➥ Toplam Ses Bilgileri:**
    ${await voiceData("topStat")}

    **➥ Haftalık Ses Bilgileri:**
    ${await voiceData("weeklyStat")}

    **➥ Günlük Ses Bilgileri:**
    ${await voiceData("dailyStat")}
    
    **───────────────**
    
    **➥ Toplam Mesaj Bilgileri:**
    ${await messageData("topStat")}

    **➥ Haftalık Mesaj Bilgileri:**
    ${await messageData("weeklyStat")}

    **➥ Günlük Mesaj Bilgileri:**
    ${await messageData("dailyStat")}

    **───────────────**

    **➥ Toplam Coin Bilgileri:**
    ${await coinData()}
    `));
    }
};