const { MessageEmbed } = require('discord.js');
const { dep } = require('../../utils');
module.exports = {
    name: 'country',
    aliases: ['countries'],
    run: async (client, message, args) => {
        if (!args[0]) return message.channel.send('Please enter a query to search!');
        const data = await client.instance.get(`/wom/countries/${args.join(' ')}`);
        if (data.data.message) return message.channel.send('Not found!');
        const { updated, country, countryInfo, cases, todayCases, deaths, todayDeaths, recovered, todayRecovered, active, critical } = data.data;
        const embed = new MessageEmbed()
            .setAuthor(`COVID-19 info for ${country}`)
            .setThumbnail(`https://flagcdn.com/w320/${countryInfo.iso2.toLowerCase()}.png`)
            .setColor('RANDOM')
            .addField('Cases: ', `${dep(cases)}(+${dep(todayCases)})`, true)
            .addField('Deaths: ', `${dep(deaths)}(+${dep(todayDeaths)})`, true)
            .addField('Recovered: ', `${dep(recovered)}(+${dep(todayRecovered)})`, true)
            .setFooter('Updated At: ')
            .setTimestamp(updated);
        if (active) embed.addField('Active cases:', dep(active));
        if (critical) embed.addField('Critical cases:', dep(critical));
        message.channel.send(embed);
    },
};