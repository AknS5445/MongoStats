const client = global.client;
const { MessageEmbed } = require("discord.js");
const config = require("../../config.json");

module.exports = async (message) => {
    let prefix = config.bot.prefix.find((x) => message.content.toLowerCase().startsWith(x));
    if (!message.guild || message.author.bot || !prefix) return
    const args = message.content.slice(1).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command))
    const owner = client.users.cache.get("796263552771817472");
    const author = message.author
    const channel = message.channel
    const guild = message.guild
    const embed = new MessageEmbed()
        .setColor(message.member.displayHexColor)
        .setAuthor(message.member.displayName, author.avatarURL({ dynamic: true, size: 2048 }))
        .setFooter("BoranGkdn was here ❤️", owner.avatarURL({ dynamic: true }))
    if (cmd) {
        if (cmd.owner && !config.bot.owners.includes(author.id)) return
        cmd.execute(client, message, args, embed, author, channel, guild, prefix);
    }
}

module.exports.conf = {
    name: "message"
}