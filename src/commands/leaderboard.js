const { MessageEmbed } = require("discord.js");
const StatDatabase = require("../models/messageUser");
const config = require("../../config.json");
const moment = require("moment");
const StatDatabases = require("../models/voiceUser");

module.exports = {
    aliases: ["tablo"],
    name: "leaderboard",
    execute: async (client, message, args, embed, author, channel, guild, prefix) => {
        const secim = args[0];
        if (!secim) return;
        if (secim === "chat") {
            StatDatabase.find({ guildID: config.Guild.GuildID }, async (err, res) => {
                res = res.filter(x => client.guilds.cache.get(config.Guild.GuildID).members.cache.get(x.userID));
                const msgList = res.filter(x => x && x.MessageNumber !== 0).sort((x, y) => y.MessageNumber - x.MessageNumber).map((val, i) => `${i + 1}. <@${val.userID}>: \`${Number(val.topStat).toLocaleString()} mesaj\`    `).splice(0, 30).join("\n");
                let Chat = new MessageEmbed()
                Chat.setColor("BLACK")
                Chat.setAuthor(`Toplam Mesaj Sıralaması`, client.guilds.cache.get(config.Guild.GuildID).iconURL({ dynamic: true }))
                Chat.setFooter(`Güncellenme Tarihi: ${moment(Date.parse(new Date().toLocaleString("tr-TR", { timeZone: "Asia/Istanbul" }))).locale("TR").format("LLL")}`)
                Chat.setTimestamp()
                Chat.setDescription(`${msgList}`)   
                channel.send(Chat)
            })
        }

        if (secim === "voice") {
            StatDatabases.find({ guildID: config.Guild.GuildID }, async (err, res) => {
                res = res.filter(x => client.guilds.cache.get(config.Guild.GuildID).members.cache.get(x.userID));
                const list = res.filter(x => x && x.MessageNumber !== 0).sort((x, y) => y.MessageNumber - x.MessageNumber).map((val, i) => `${i + 1}. <@${val.userID}>: \`${moment.duration(val.topStat).format("H [saat], m [dakika] s [saniye]")}\``).splice(0, 30).join("\n");
                let MessageEdit = new MessageEmbed()
                MessageEdit.setColor("BLACK")
                MessageEdit.setAuthor(`Toplam Ses Sıralaması`, client.guilds.cache.get(config.Guild.GuildID).iconURL({ dynamic: true }))
                MessageEdit.setFooter(`Güncellenme Tarihi: ${moment(Date.parse(new Date().toLocaleString("tr-TR", { timeZone: "Asia/Istanbul" }))).locale("TR").format("LLL")}`)

                MessageEdit.setDescription(`${list}`)
                channel.send(MessageEdit)
            });
        }
    }
};
