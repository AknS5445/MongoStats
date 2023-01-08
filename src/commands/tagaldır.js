const coin = require("../models/coin");
const taggeds = require("../models/taggeds");
const config = require("../../config.json");

module.exports = {
    aliases: ["tag-aldır", "taglıaldır"],
    name: "tagaldır",
    help: "tagaldır [kullanıcı]",
    execute: async (client, message, args, embed, author, channel, guild) => {
        if (!config.coin.stafs.some(x => message.member.roles.cache.has(x))) return;
        const member = message.mentions.members.first() || guild.members.cache.get(args[0]);
        if (!member) return channel.send(embed.setDescription("Bir üye belirtmelisin!"));
        if (!member.user.username.includes(config.coin.Tag)) return channel.send(embed.setDescription("Kullanıcının taglı olup olmadığından emin ol!"));
        const taggedData = await taggeds.findOne({ guildID: guild.id, userID: author.id });
        if (taggedData && taggedData.taggeds.includes(member.user.id)) return channel.send(embed.setDescription("Bu kullanıcıya daha önce tag aldırılmış."));

        embed.setDescription(`${message.member.toString()} kullanıcısı sana tag aldırmak istiyor, kabul ediyor musun?`);
        const msg = await channel.send(member.toString(), { embed });
        msg.react("✅");
        msg.react("❌");

        msg.awaitReactions((reaction, user) => ["✅", "❌"].includes(reaction.emoji.name) && user.id === member.user.id, {
            max: 1,
            time: 30000,
            errors: ['time']
        }).then(async collected => {
            const reaction = collected.first();
            if (reaction.emoji.name === '✅') {
                await coin.findOneAndUpdate({ guildID: guild.id, userID: author.id }, { $inc: { coin: config.coin.taggesCoin } }, { upsert: true });
                embed.setColor("GREEN");
                msg.edit(embed.setDescription(`${member.toString()} kullanıcısına başarıyla tag aldırıldı!`));
                await taggeds.findOneAndUpdate({ guildID: guild.id, userID: author.id }, { $push: { taggeds: member.user.id } }, { upsert: true });
            } else {
                embed.setColor("RED");
                msg.edit(embed.setDescription(`${member.toString()} kullanıcısı, tag aldırma teklifini reddetti!`));
            }
        }).catch(() => msg.edit(embed.setDescription("Tag aldırma işlemi yanıt verilmediği için iptal edildi.")));
    }
}