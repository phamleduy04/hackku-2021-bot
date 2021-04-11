const { Client, Collection } = require('discord.js');
const { readdirSync } = require('fs');
const axios = require('axios');
const client = new Client();
const { config } = require('dotenv');
config({
    path: __dirname + '/.env',
});
const { TOKEN, PREFIX } = process.env;
client.commands = new Collection();
client.aliases = new Collection();
client.catagories = readdirSync('./commands/');
client.instance = axios.create({
    baseURL: 'http://localhost:3000',
});
["command"].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.on('ready', () => {
    console.log(`${client.user.username} is ready!`);
    client.user.setPresence({
        activity: {
            name: 'COV Bot',
            type: 'WATCHING',
        },
        status: 'online',
    });
});


client.on('message', async message => {
    if (message.author.bot || message.channel.type !== 'text') return;
    if (!message.guild || !message.content.toLowerCase().startsWith(PREFIX)) return;
    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;
    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));
    if (command) command.run(client, message, args);

});
client.login(TOKEN);