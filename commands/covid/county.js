const { MessageEmbed } = require('discord.js');
const { dep } = require('../../utils');
module.exports = {
    name: 'county',
    run: async (client, message, args) => {
        if (!args[0]) return message.channel.send('Please enter a county name to search!');
        const data = await client.instance.get(`/jhu/county/${args.join(' ')}`);
        if (data.data.message) return message.channel.send('Not found!');
        const { province, updatedAt, stats, county } = data.data[args.join(' ')][0];
        const embed = new MessageEmbed()
            .setAuthor(`COVID-19 data for county ${county}, ${province}`)
            .addField('Confirmed case:', dep(stats.confirmed))
            .addField('Deaths case: ', dep(stats.deaths))
            .addField('Recovered case: ', dep(stats.recovered))
            .setTimestamp(updatedAt)
            .setFooter('Updated at: ');
        message.channel.send(embed);
    },
};