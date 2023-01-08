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
    name: "ytstat",
    aliases: ["yetkili", "ystat"],
    help: "ytstat",
    execute: async (client, message, args, embed, author, channel, guild) => {
        const member = message.mentions.members.first() || guild.members.cache.get(args[0]) || message.member
        if (config.coin.stafs.some(x => !member.roles.cache.has(x))) return
        if (config.coin.stafs.some(x => !message.member.roles.cache.has(x))) return
        const category = async (parentsArray) => {
            const data = await voiceUserParent.find({ guildID: guild.id, userID: member.id });
            const voiceUserParentData = data.filter((x) => parentsArray.includes(x.parentID));
            let voiceStat = 0;
            for (var i = 0; i <= voiceUserParentData.length; i++) {
                voiceStat += voiceUserParentData[i] ? voiceUserParentData[i].parentData : 0;
            }
            return moment.duration(voiceStat).format("H [saat], m [dakika] s [saniye]");
        };
        const Active1 = await messageUserChannel.find({ messguildID: guild.id, userID: member.id }).sort({ channelData: -1 });
        const Active2 = await voiceUserChannel.find({ guildID: guild.id, userID: member.id }).sort({ channelData: -1 });
        const voiceLength = Active2 ? Active2.length : 0;
        let voiceTop;
        let messageTop;
        Active1.length > 0 ? messageTop = Active1.splice(0, 5).map(x => `<#${x.channelID}>: \`${Number(x.channelData).toLocaleString()} mesaj\``).join("\n") : messageTop = "Herhangi bir istatistik bulunmuyor."
        Active2.length > 0 ? voiceTop = Active2.splice(0, 5).map(x => `<#${x.channelID}>: \`${moment.duration(x.channelData).format("H [saat], m [dakika] s [saniye]")}\``).join("\n") : voiceTop = "Veri bulunmuyor."

        const messageData = await messageUser.findOne({ guildID: guild.id, userID: member.id });
        const voiceData = await voiceUser.findOne({ guildID: guild.id, userID: member.id });

        const messageDaily = messageData ? messageData.dailyStat : 0;
        const messageWeekly = messageData ? messageData.weeklyStat : 0;

        const voiceDaily = moment.duration(voiceData ? voiceData.dailyStat : 0).format("H [saat], m [dakika] s [saniye]");
        const voiceWeekly = moment.duration(voiceData ? voiceData.weeklyStat : 0).format("H [saat], m [dakika] s [saniye]");

        const coinData = await coin.findOne({ guildID: guild.id, userID: member.id });
        const recordData = await record.findOne({ guildID: guild.id, userID: member.user.id });
        const inviteData = await invite.findOne({ guildID: guild.id, userID: member.user.id });

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
        const taggedData = await taggeds.findOne({ guildID: guild.id, userID: member.id });
        let currentRank = client.ranks.filter(x => (coinData ? coinData.coin : 0) >= x.coin);
        currentRank = currentRank[currentRank.length - 1];

        var PuanDetaylari = new MessageButton()
            .setLabel("Puan Detayları")
            .setID("puan_detaylari")
            .setStyle("green")
            .setEmoji("🔔")

        var GenelPuanDetaylari = new MessageButton()
            .setLabel("Puan İstatistikleri")
            .setID("genel_puan_detaylari")
            .setStyle("blurple")
            .setEmoji("🏆")

        var Iptal = new MessageButton()
            .setLabel("İstatistikler")
            .setID("iptal_button")
            .setStyle("red")
            .setEmoji("🖨️")

        const row = new MessageActionRow()
            .addComponents(PuanDetaylari, GenelPuanDetaylari, Iptal)
        const coinStatus = config.coin.stafs.some(x => member.roles.cache.has(x)) && client.ranks.length > 0 ?
            `**➥ Puan Durumu:** ${taggedData ? `\nTag aldırdığı kişi sayısı: \`${taggedData.taggeds.length}\`` : ""}
- Puanınız: \`${coinData ? Math.floor(coinData.coin) : 0}\`, Gereken: \`${maxValue.coin}\` 
${progressBar(coinData ? Math.floor(coinData.coin) : 0, maxValue.coin, 8)} \`${coinData ? Math.floor(coinData.coin) : 0} / ${maxValue.coin}\`
${currentRank ? `**───────────────** 
**➥ Yetki Durumu:** 
${currentRank !== client.ranks[client.ranks.length - 1] ? `Şu an ${Array.isArray(currentRank.role) ? currentRank.role.map(x => `<@&${x}>`).join(", ") : `<@&${currentRank.role}>`} rolündesiniz. ${Array.isArray(maxValue.role) ? maxValue.role.length > 1 ? maxValue.role.slice(0, -1).map(x => `<@&${x}>`).join(", ") + " ve " + maxValue.role.map(x => `<@&${x}>`).slice(-1) : maxValue.role.map(x => `<@&${x}>`).join("") : `<@&${maxValue.role}>`} rolüne ulaşmak için \`${Math.floor(maxValue.coin - coinData.coin)}\` coin daha kazanmanız gerekiyor!` : "Şu an son yetkidesiniz! Emekleriniz için teşekkür ederiz."}` : `**───────────────** 
**➥ Yetki Durumu:** 
${Array.isArray(maxValue.role) ? maxValue.role.length > 1 ? maxValue.role.slice(0, -1).map(x => `<@&${x}>`).join(", ") + " ve " + maxValue.role.map(x => `<@&${x}>`).slice(-1) : maxValue.role.map(x => `<@&${x}>`).join("") : `<@&${maxValue.role}>`} rolüne ulaşmak için \`${maxValue.coin - (coinData ? Math.floor(coinData.coin) : 0)}\` coin daha kazanmanız gerekiyor!`}` : "";

        embed.setThumbnail(author.avatarURL({ dynamic: true, size: 2048 }))
        embed.setDescription(`
    ${member.toString()} (${member.roles.highest}) kişisinin sunucuda ki istatistikleri;
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
        let msg = await channel.send({ components: [row], embed: embed });

        var filter = (button) => button.clicker.user.id === message.author.id;

        let collector = await msg.createButtonCollector(filter, { time: 99999999 })

        collector.on("collect", async (button) => {
            if (button.id === "puan_detaylari") {
                await button.reply.defer()
                const puan = new MessageEmbed()
                    .setDescription(`
      ${member.toString()}, (${member.roles.highest}) üyesinin \`${guild.name}\` sunucusunda puanlama tablosu aşağıda belirtilmiştir.
      `)

                    .setDescription(`**Puan Durumu:**
      Puanınız: \`${coinData ? Math.floor(coinData.coin) : 0}\`, Gereken Puan: \`${maxValue.coin}\`
      ${progressBar(coinData ? coinData.coin : 0, maxValue.coin, 9)} \`${coinData ? coinData.coin : 0} / ${maxValue.coin}\`

**Puan Detayları:**
      Kayıtlar: \`${recordData ? recordData.record.length : 0} (Puan Etkisi: +${recordData ? recordData.record.length : 0})\`
      Taglılar: \`${taggedData ? taggedData.taggeds.length : 0} (Puan Etkisi: +${taggedData ? taggedData.taggeds.length * 25 : 0})\`
      Chat Puan: \`${messageData ? messageData.topStat : 0} mesaj (Puan Etkisi: +${messageData ? messageData.topStat * 2 : 0})\`
      Sesli Puan: \`${moment.duration(voiceData ? voiceData.topStat : 0).format("m")} dakika (Puan Etkisi: +${moment.duration(voiceData ? voiceData.topStat : 0).format("m") * 4})\`

**Yetki Durumu:**
      ${coinStatus}`)
                    .setColor("RANDOM");

                msg.edit({
                    embed: puan,
                    components: row
                })

            }

            if (button.id === "genel_puan_detaylari") {
                await button.reply.defer()
                const ceza = new MessageEmbed()
                    .setColor("RANDOM")
                    .setDescription(`
    ${member.toString()}, (${member.roles.highest}) kullanıcısının tarihinden itibaren \`${guild.name}\` sunucusunda genel puanlama tablosu aşağıda belirtilmiştir.
`)
                    .addField(`**Puan Detayları:**`, `
Kayıt: (\`Puan Etkisi: +${recordData ? recordData.record.length * 5.5 : 0}\`)
Taglı: (\`Puan Etkisi: +${taggedData ? taggedData.taggeds.length * 25 : 0}\`)
Toplam Ses: (\`Puan Etkisi: +${moment.duration(voiceData ? voiceData.topStat : 0).format("m") * 4}\`)
Toplam Mesaj: (\`Puan Etkisi: +${messageData ? messageData.topStat * 2 : 0}\`)
 `, false)

                    .addField(`**Net Puanlama Bilgisi**`, `
Kayıt işlemi yaparak, \`+5.5\` puan kazanırsın.
Taglı üye belirleyerek, \`+25\` puan kazanırsınız.
Seste kalarak, ortalama olarak \`+4\` puan kazanırsınız.
Yazı yazarak, ortalama olarak, \`+2\` puan kazanırsınız.
 `, false)

                    .addField(`**Yetki Durumu:**`, `
${coinStatus}
 `, false)

                msg.edit({
                    embed: ceza,
                    components: row
                })
            }

            if (button.id === "iptal_button") {
                await button.reply.defer()
                const iptal = new MessageEmbed()
                    .setColor("RANDOM")
                    .setDescription(`
${member.toString()}, (${member.roles.highest}) üyesinin tarihinden itibaren \`${guild.name}\` sunucusunda toplam ses ve mesaj bilgileri aşağıda belirtilmiştir.
`)

                    .addFields(
                        {
                            name: "**Toplam Ses**", value: `
\`\`\`fix
${moment.duration(voiceData ? voiceData.topStat : "Herhangi bir istatistik bulunmuyor.").format("H [saat], m [dakika]")}
\`\`\`
`, inline: true
                        },
                        {
                            name: "**Toplam Mesaj**", value: `
\`\`\`fix
${messageData ? messageData.topStat : "Herhangi bir istatistik bulunmuyor."} mesaj
\`\`\`
`, inline: true
                        },
                        {
                            name: "**Toplam Kayıt**", value: `
\`\`\`fix
${recordData ? recordData.record.length : "Herhangi bir istatistik bulunmuyor."}
\`\`\`
`, inline: true
                        },
                        {
                            name: "**Toplam Taglı**", value: `
\`\`\`fix
${taggedData ? `${taggedData.taggeds.length} kişi` : "Herhangi bir istatistik bulunmuyor."} 
\`\`\`
`, inline: true
                        },
                    )


                iptal.addField(`**Sesli Sohbet İstatistiği**`, `
  Toplam: \`${moment.duration(voiceData ? voiceData.topStat : 0).format("H [saat], m [dakika]")}\`
  Public Odalar: \`${await category(config.parents.publicParents)}\`
  Secret Odalar: \`${await category(config.parents.privateParents)}\`
  Alone Odalar: \`${await category(config.parents.aloneParents)}\`
  Yönetim Yetkili Odaları: \`${await category(config.parents.funParents)}\`
  Kayıt Odaları: \`${await category(config.parents.registerParents)}\`
   `, false);


                iptal.addField(`**Mesaj İstatistiği**`, `
  Toplam: \`${messageData ? messageData.topStat : 0}\`
  Haftalık Mesaj: \`${Number(messageWeekly).toLocaleString()} mesaj\`
  Günlük Mesaj: \`${Number(messageDaily).toLocaleString()} mesaj\`
   `, false);

                msg.edit({
                    embed: iptal,
                    components: row
                })

            }
        })
    }
};

function progressBar(value, maxValue, size) {
    const progress = Math.round(size * ((value / maxValue) > 1 ? 1 : (value / maxValue)));
    const emptyProgress = size - progress > 0 ? size - progress : 0;

    const progressText = config.emojis.fill.repeat(progress);
    const emptyProgressText = config.emojis.empty.repeat(emptyProgress);

    return emptyProgress > 0 ? config.emojis.fillStart + progressText + emptyProgressText + config.emojis.emptyEnd : config.emojis.fillStart + progressText + emptyProgressText + config.emojis.fillEnd;
};
