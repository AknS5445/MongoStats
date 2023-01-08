module.exports = {
    name: "rank-role",
    aliases: ["rr", "rankrole"],
    owner: true,
    execute: async (client, message, args, embed, author, channel, guild) => {
        channel.send(embed.setDescription(client.ranks.map(x => `<@&${x.role}>: **${x.coin}**`)))
    }
}