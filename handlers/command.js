const ascii = require('ascii-table');
const { readdirSync } = require('fs');
module.exports = (client) => {
    let count = 0;
    const table = new ascii("Commands");
    table.setHeading("Command", "Load status");
    readdirSync("./commands/").forEach(dir => {
        const commands = readdirSync(`./commands/${dir}/`).filter(file => file.endsWith('.js'));
        for (const file of commands) {
            const pull = require(`../commands/${dir}/${file}`);
            if (pull.name) {
                count++;
                client.commands.set(pull.name, pull);
                table.addRow(file, "✅");
            } else {
                table.addRow(file, "❌ missing help.name");
                continue;
            }
            if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
        }
    });

    console.log(table.toString());
    console.log(`${count} commands ready to serve!`);
};