const client = global.client;
const config = require("../../config.json");
const StatDatabase = require("../models/messageUser");
const moment = require("moment");
const { MessageEmbed } = require("discord.js");

module.exports = async () => {
    //let LeaderBoard = await client.channels.cache.get(config.channels.leaderboard).messages.fetch(config.Message.ChatleaderBoardMessages);
    //ChatLeaderBoard()
    setInterval(() => {
        ChatLeaderBoard()
    }, 1000 * 60 * 30);
    function ChatLeaderBoard() {
        StatDatabase.find({ guildID: config.Guild.GuildID }, async (err, res) => {
            res = res.filter(x => client.guilds.cache.get(config.Guild.GuildID).members.cache.get(x.userID));
            const msgList = res.filter(x => x).sort((x, y) => y.topStat - x.topStat).map((val, i) =>`${i + 1}. <@${val.userID}>: \`${val.topStat} mesaj\``).splice(0, 15).join("\n");
            let Chat = new MessageEmbed()
            Chat.setColor("BLACK")
            Chat.setAuthor(`Toplam Mesaj Sıralaması`, client.guilds.cache.get(config.Guild.GuildID).iconURL({ dynamic: true }))
            Chat.setFooter(`Güncellenme Tarihi:`)
            Chat.setTimestamp(Date.now());
            Chat.setDescription(`${msgList}`)
            LeaderBoard.edit(Chat)
        })
    }

}

module.exports.conf = {
    name: "ready",
};