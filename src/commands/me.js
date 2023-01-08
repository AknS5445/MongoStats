const moment = require("moment");
require("moment-duration-format");
const config = require("../../config.json");
const messageUserChannel = require("../models/messageUserChannel");
const voiceUserChannel = require("../models/voiceUserChannel");
const messageUser = require("../models/messageUser");
const voiceUser = require("../models/voiceUser");
const voiceUserParent = require("../models/voiceUserParent");
const coin = require("../models/coin");
const taggeds = require("../models/taggeds");

module.exports = {
    name: "me",
    aliases: [],
    help: "me",
    execute: async (client, message, args, embed) => {
        const category = async (parentsArray) => {
            const data = await voiceUserParent.find({ guildID: message.guild.id, userID: message.author.id });
            const voiceUserParentData = data.filter((x) => parentsArray.includes(x.parentID));
            let voiceStat = 0;
            for (var i = 0; i <= voiceUserParentData.length; i++) {
                voiceStat += voiceUserParentData[i] ? voiceUserParentData[i].parentData : 0;
            }
            return moment.duration(voiceStat).format("H [saat], m [dakika] s [saniye]");
        };
        const member = message.member
        const Active1 = await messageUserChannel.find({ guildID: message.guild.id, userID: message.author.id }).sort({ channelData: -1 });
        const Active2 = await voiceUserChannel.find({ guildID: message.guild.id, userID: message.author.id }).sort({ channelData: -1 });
        const voiceLength = Active2 ? Active2.length : 0;
        let voiceTop;
        let messageTop;
        Active1.length > 0 ? messageTop = Active1.splice(0, 5).map(x => `<#${x.channelID}>: \`${Number(x.channelData).toLocaleString()} mesaj\``).join("\n") : messageTop = "Veri bulunmuyor."
        Active2.length > 0 ? voiceTop = Active2.splice(0, 5).map(x => `<#${x.channelID}>: \`${moment.duration(x.channelData).format("H [saat], m [dakika] s [saniye]")}\``).join("\n") : voiceTop = "Veri bulunmuyor."

        const messageData = await messageUser.findOne({ guildID: message.guild.id, userID: message.author.id });
        const voiceData = await voiceUser.findOne({ guildID: message.guild.id, userID: message.author.id });

        const messageDaily = messageData ? messageData.dailyStat : 0;
        const messageWeekly = messageData ? messageData.weeklyStat : 0;

        const voiceDaily = moment.duration(voiceData ? voiceData.dailyStat : 0).format("H [saat], m [dakika] s [saniye]");
        const voiceWeekly = moment.duration(voiceData ? voiceData.weeklyStat : 0).format("H [saat], m [dakika] s [saniye]");

        const coinData = await coin.findOne({ guildID: message.guild.id, userID: message.author.id });

        const filteredParents = message.guild.channels.cache.filter((x) =>
            x.type === "category" &&
            !config.parents.publicParents.includes(x.id) &&
            !config.parents.registerParents.includes(x.id) &&
            !config.parents.solvingParents.includes(x.id) &&
            !config.parents.privateParents.includes(x.id) &&
            !config.parents.aloneParents.includes(x.id) &&
            !config.parents.funParents.includes(x.id)
        );
 
        const maxValue = client.ranks[client.ranks.indexOf(client.ranks.find(x => x.coin >= (coinData ? coinData.coin : 0)))] || client.ranks[client.ranks.length - 1];
        const taggedData = await taggeds.findOne({ guildID: message.guild.id, userID: message.author.id });
        let currentRank = client.ranks.filter(x => (coinData ? coinData.coin : 0) >= x.coin);
        currentRank = currentRank[currentRank.length - 1];
        const coinStatus = config.coin.stafs.some(x => message.member.roles.cache.has(x)) && client.ranks.length > 0 ?
            `**➥ Puan Durumu:** ${taggedData ? `\nTag aldırdığı üye sayısı: \`${taggedData.taggeds.length}\`` : ""}
- Puanınız: \`${coinData ? Math.floor(coinData.coin) : 0}\`, Gereken: \`${maxValue.coin}\` 
${progressBar(coinData ? Math.floor(coinData.coin) : 0, maxValue.coin, 8)} \`${coinData ? Math.floor(coinData.coin) : 0} / ${maxValue.coin}\`
${currentRank ? `**───────────────** 
**➥ Yetki Durumu:** 
${currentRank !== client.ranks[client.ranks.length - 1] ? `Şu an ${Array.isArray(currentRank.role) ? currentRank.role.map(x => `<@&${x}>`).join(", ") : `<@&${currentRank.role}>`} rolündesiniz. ${Array.isArray(maxValue.role) ? maxValue.role.length > 1 ? maxValue.role.slice(0, -1).map(x => `<@&${x}>`).join(", ") + " ve " + maxValue.role.map(x => `<@&${x}>`).slice(-1) : maxValue.role.map(x => `<@&${x}>`).join("") : `<@&${maxValue.role}>`} rolüne ulaşmak için \`${Math.floor(maxValue.coin - coinData.coin)}\` coin daha kazanmanız gerekiyor!` : "Şu an son yetkidesiniz! Emekleriniz için teşekkür ederiz."}` : `**───────────────** 
**➥ Yetki Durumu:** 
${Array.isArray(maxValue.role) ? maxValue.role.length > 1 ? maxValue.role.slice(0, -1).map(x => `<@&${x}>`).join(", ") + " ve " + maxValue.role.map(x => `<@&${x}>`).slice(-1) : maxValue.role.map(x => `<@&${x}>`).join("") : `<@&${maxValue.role}>`} rolüne ulaşmak için \`${maxValue.coin - (coinData ? Math.floor(coinData.coin) : 0)}\` coin daha kazanmanız gerekiyor!`}` : "";

        embed.setThumbnail(message.author.avatarURL({ dynamic: true, size: 2048 }))
        embed.setDescription(`
    ${message.author.toString()} (${message.member.roles.highest}) kişisinin sunucuda ki istatistikleri;
    **───────────────**
    **➥ Ses Bilgileri:**
  • Toplam: \`${moment.duration(voiceData ? voiceData.topStat : 0).format("H [saat], m [dakika] s [saniye]")}\`
  • Public Odalar: \`${await category(config.parents.publicParents)}\`
  • Kayıt Odaları: \`${await category(config.parents.registerParents)}\`
  • Sorun Çözme & Terapi: \`${await category(config.parents.solvingParents)}\`
  • Private Odalar: \`${await category(config.parents.privateParents)}\`
  • Game Odalar: \`${await category(config.parents.aloneParents)}\`
  • Oyun & Eğlence Odaları: \`${await category(config.parents.funParents)}\`
  • Diğer Odalar: \`${await category(filteredParents.map(x => x.id))}\`
    **───────────────**
    **➥ Sesli Kanal Bilgileri: (\`Toplam ${voiceLength} kanal\`)**
    ${voiceTop}
    **───────────────**
    **➥ Mesaj Bilgileri: (\`Toplam ${messageData ? messageData.topStat : 0} mesaj\`)**
    ${messageTop}
    **───────────────**
    ${coinStatus} 
    `)
        embed.addField("Ses İstatistikleri:", `
    \`•\` Haftalık Ses: \`${voiceWeekly}\`
    \`•\` Günlük Ses: \`${voiceDaily}\`
    `, true);
        embed.addField("Mesaj İstatistikleri:", `
    \`•\` Haftalık Mesaj: \`${Number(messageWeekly).toLocaleString()} mesaj\`
    \`•\` Günlük Mesaj: \`${Number(messageDaily).toLocaleString()} mesaj\`
    `, true);
message.channel.send(embed);
    }
};

function progressBar(value, maxValue, size) {
    const progress = Math.round(size * ((value / maxValue) > 1 ? 1 : (value / maxValue)));
    const emptyProgress = size - progress > 0 ? size - progress : 0;

    const progressText = config.emojis.fill.repeat(progress);
    const emptyProgressText = config.emojis.empty.repeat(emptyProgress);

    return emptyProgress > 0 ? config.emojis.fillStart + progressText + emptyProgressText + config.emojis.emptyEnd : config.emojis.fillStart + progressText + emptyProgressText + config.emojis.fillEnd;
};
