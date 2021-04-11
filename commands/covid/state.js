const { MessageEmbed } = require('discord.js');
const { dep } = require('../../utils');
module.exports = {
    name: 'state',
    alises: ['states', 'usstate'],
    run: async (client, message, args) => {
        if (!args[0]) return message.channel.send('Please enter a state name to search!');
        const data = await client.instance.get(`/wom/state/${args.join(' ')}`);
        if (data.data.message) return message.channel.send('Not found!');
        const { state, updated, cases, todayCases, deaths, todayDeaths, recovered, active } = data.data;
        const embed = new MessageEmbed()
            .setAuthor(`COVID-19 info at ${state},US`)
            .setColor('RANDOM')
            .addField('Cases: ', `${dep(cases)} (+${dep(todayCases)})`, true)
            .addField('Deaths: ', `${dep(deaths)} (+${dep(todayDeaths)})`, true)
            .addField('Recovered: ', `${dep(recovered)}`, true)
            .setFooter('Updated At: ')
            .setTimestamp(updated);
        if (active) embed.addField('Active cases:', dep(active));
        message.channel.send(embed);
    },
};