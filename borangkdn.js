const { Client, Collection } = require("discord.js");
const client = (global.client = new Client({ fetchAllMembers: true }));
const { readdir, readdirSync } = require("fs");
const config = require("./config.json");
const moment = require('moment');
const ms = require("ms");
require("moment-duration-format");
const commands = client.commands = new Collection();
const aliases = client.aliases = new Collection();
client.ranks = [
    { role: "YETKILI ROLU 2", coin: 16000 },
    { role: "YETKILI ROLU 3", coin: 18000 },
    { role: "YETKILI ROLU 4", coin: 21000 },
    { role: "YETKILI ROLU 5", coin: 25000 },
    { role: "YETKILI ROLU 6", coin: 30000 },
    { role: "YETKILI ROLU 7", coin: 42000 },
    { role: "YETKILI ROLU 8", coin: 60000 },
    { role: "YETKILI ROLU 9", coin: 70000 },
    { role: "YETKILI ROLU 10", coin: 100000 },
]

const disbut = require("discord-buttons")(client)

require("./src/helpers/mongoHandler");

readdirSync('./src/commands', { encoding: 'utf8' }).filter(file => file.endsWith(".js")).forEach((files) => {
    let command = require(`./src/commands/${files}`);
    console.log(`[BORANGKDN-COMMAND] ${command.name} adlı komut yüklendi!`)
    commands.set(command.name, command);
    if (!command.aliases || command.aliases.length < 1) return
    command.aliases.forEach((otherUses) => { aliases.set(otherUses, command.name); })
})

readdir("./src/events", (err, files) => {
    if (err) return console.error(err);
    files.filter((file) => file.endsWith(".js")).forEach((file) => {
        let prop = require(`./src/events/${file}`);
        if (!prop.conf) return;
        client.on(prop.conf.name, prop)
        console.log(`[BORANGKDN-EVENT] ${prop.conf.name} adlı event yüklendi!`);
    });
});

client.login(config.bot.token).then(x => console.log(`Bot ${client.user.username} olarak giriş yaptı!`)).catch(err => console.log(`Bot Giriş yapamadı sebep: ${err}`));