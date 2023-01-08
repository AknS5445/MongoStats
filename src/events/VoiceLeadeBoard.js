const client = global.client;
const config = require("../../config.json");
const StatDatabase = require("../models/voiceUser");
const moment = require("moment");
const { MessageEmbed } = require("discord.js");

module.exports = async () => {
    //let LeaderBoard = await client.channels.cache.get(config.channels.leaderboard).messages.fetch(config.Message.VoiceleaderBoardMessages);
    //checkingLeader()
    setInterval(() => {
        checkingLeader()
    }, 1000 * 60 * 30);
    function checkingLeader() {
        StatDatabase.find({ guildID: config.Guild.GuildID }, async (err, res) => {
            res = res.filter(x => client.guilds.cache.get(config.Guild.GuildID).members.cache.get(x.userID));
            const list = res.filter(x => x).sort((x, y) => y.topStat - x.topStat).map((val, i) => `${i + 1}. <@${val.userID}>: \`${moment.duration(val.topStat).format("H [saat], m [dakika] s [saniye]")}\``).splice(0, 15).join("\n");
            let MessageEdit = new MessageEmbed()
            MessageEdit.setColor("BLACK")
            MessageEdit.setAuthor(`Toplam Ses Sıralaması`, client.guilds.cache.get(config.Guild.GuildID).iconURL({ dynamic: true }))
            MessageEdit.setFooter(`Güncellenme:`)
            MessageEdit.setDescription(`${list}`)
            MessageEdit.setTimestamp(Date.now());
            LeaderBoard.edit(MessageEdit)
        });
    }

}

module.exports.conf = {
    name: "ready",
};