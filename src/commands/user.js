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
const record = require("../models/record");
const invite = require("../models/invite");
const { MessageButton, MessageActionRow } = require('discord-buttons');
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "user",
  aliases: ["kullanıcı"],
  help: "user [kullanıcı]",
  execute: async (client, message, args, embed, author, channel, guild) => {
    const member = message.mentions.members.first() || guild.members.cache.get(args[0]);
    if (!member) return channel.send(embed.setDescription("Öncelikle geçerli bir kullanıcı belirtmelisin!"));

    const category = async (parentsArray) => {
      const data = await voiceUserParent.find({ guildID: guild.id, userID: member.user.id });
      const voiceUserParentData = data.filter((x) => parentsArray.includes(x.parentID));
      let voiceStat = 0;
      for (var i = 0; i <= voiceUserParentData.length; i++) {
        voiceStat += voiceUserParentData[i] ? voiceUserParentData[i].parentData : 0;
      }
      return moment.duration(voiceStat).format("H [saat], m [dakika]");
    };

    const Active1 = await messageUserChannel.find({ guildID: guild.id, userID: member.user.id }).sort({ channelData: -1 });
    const Active2 = await voiceUserChannel.find({ guildID: guild.id, userID: member.user.id }).sort({ channelData: -1 });
    const voiceLength = Active2 ? Active2.length : 0;
    let voiceTop;
    let messageTop;
    Active1.length > 0 ? messageTop = Active1.splice(0, 5).map(x => `<#${x.channelID}>: \`${Number(x.channelData).toLocaleString()} mesaj\``).join("\n") : messageTop = "Herhangi bir istatistik bulunmuyor."
    Active2.length > 0 ? voiceTop = Active2.splice(0, 5).map(x => `<#${x.channelID}>: \`${moment.duration(x.channelData).format("H [saat], m [dakika]")}\``).join("\n") : voiceTop = "Herhangi bir istatistik bulunmuyor."

    const messageData = await messageUser.findOne({ guildID: guild.id, userID: member.user.id });
    const voiceData = await voiceUser.findOne({ guildID: guild.id, userID: member.user.id });
    const taggedData = await taggeds.findOne({ guildID: guild.id, userID: member.user.id });

    const messageDaily = messageData ? messageData.dailyStat : 0;
    const messageWeekly = messageData ? messageData.weeklyStat : 0;

    const voiceDaily = moment.duration(voiceData ? voiceData.dailyStat : 0).format("H [saat], m [dakika]");
    const voiceWeekly = moment.duration(voiceData ? voiceData.weeklyStat : 0).format("H [saat], m [dakika]");

    const coinData = await coin.findOne({ guildID: guild.id, userID: member.user.id });

    const filteredParents = guild.channels.cache.filter((x) =>
      x.type === "category" &&
      !config.parents.publicParents.includes(x.id) &&
      !config.parents.registerParents.includes(x.id) &&
      !config.parents.solvingParents.includes(x.id) &&
      !config.parents.privateParents.includes(x.id) &&
      !config.parents.aloneParents.includes(x.id) &&
      !config.parents.funParents.includes(x.id)
    );

    const maxValue = client.ranks[client.ranks.indexOf(client.ranks.find(x => x.coin >= (coinData ? coinData.coin : 0)))] || client.ranks[client.ranks.length - 1];

    const coinStatus = config.coin.stafs.some(x => member.roles.cache.has(x)) && client.ranks.length > 0 ? ` **➥ Puan Durumu:**${taggedData ? `\nTag aldırdığı üye sayısı: \`${taggedData.taggeds.length}\`` : ""}\n- Puanınız: \`${coinData ? coinData.coin : 0}\`, Gereken: \`${maxValue.coin}\` \n${progressBar(coinData ? coinData.coin : 0, maxValue.coin, 8)} \`${coinData ? coinData.coin : 0} / ${maxValue.coin}\`` : "";

    embed.setThumbnail(member.user.avatarURL({ dynamic: true, size: 2048 }))
    embed.setDescription(`
    ${member.user.toString()} (${member.roles.highest}) kişisinin sunucu verileri
    **───────────────**
    **➥ Ses Bilgileri:**
  • Toplam: \`${moment.duration(voiceData ? voiceData.topStat : 0).format("H [saat], m [dakika]")}\`
  • Public Odalar: \`${await category(config.parents.publicParents)}\`
  • Kayıt Odaları: \`${await category(config.parents.registerParents)}\`
  • Sorun Çözme & Terapi: \`${await category(config.parents.solvingParents)}\`
  • Private Odalar: \`${await category(config.parents.privateParents)}\`
  • Alone Odalar: \`${await category(config.parents.aloneParents)}\`
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
    embed.addField("➥ Ses İstatistikleriF:", `
     \`•\` Haftalık Ses: \`${voiceWeekly}\`
     \`•\` Günlük Ses: \`${voiceDaily}\`
    `, true);
    embed.addField("➥ Mesaj İstatistikleri:", `
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
