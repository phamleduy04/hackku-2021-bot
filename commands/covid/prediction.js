const shell = require('shelljs');
const { join } = require('path');
module.exports = {
    name: 'predict',
    aliases: ['prediction'],
    run: async (client, message, args) => {
        if (!args[0]) return message.channel.send('Please enter a query to search!');
        const msg = await message.channel.send('Processing! Please wait............');
        let data;
        try {
            data = await client.instance.get(`/api/${args.join(' ')}`);
        }
        catch(err) {
            return message.channel.send('Error, please try again later!');
        }
        await shell.cd(join(__dirname, '..', '..', 'prediction'));
        const { stdout } = await shell.exec(`python3 prediction.py -c ${args.join(' ')}`);

        message.reply(stdout, {
            files: [join(__dirname, '..', '..', 'prediction', 'final.jpg')],
        });
        if (msg.deletable) msg.delete();
    },
};