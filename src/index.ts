import * as FS from "fs";
import * as Aplenture from "aplenturejs";
import * as Commands from "./commands";
import { Config, Context } from "./models";

const stopwatch = new Aplenture.Stopwatch();

stopwatch.start();

const TIMEOUT_EXIT = 1000;

const infos: Aplenture.ServerConfig = JSON.parse(FS.readFileSync(process.env.PWD + '/package.json').toString());
const log = Aplenture.Log.createFileLog(`${process.env.PWD}/${infos.name}.log`);

process.title = infos.name;

process.on('exit', code => log.write("exit with code " + code));
process.on('uncaughtException', error => log.error(error));
process.on('unhandledRejection', reason => log.error(new Error(reason.toString())));

const config: Config = Object.assign({}, require(process.env.PWD + '/config.json'), {
    name: infos.name,
    version: infos.version,
    author: infos.author,
    description: infos.description,
});

const context: Context = {
    databases: {},
    repositories: {}
};

const command = process.argv.slice(2).join(' ') || "help";
const commander = new Aplenture.Commander();

Object.keys(config.databases).forEach(name => context.databases[name] = new Aplenture.Database(name, config.databases[name]));
Object.keys(config.repositories).forEach(name => context.repositories[name] = Aplenture.createInstance<Aplenture.Repository<any>>(
    config.repositories[name].path,
    config.repositories[name].class,
    context.databases[config.repositories[name].database],
    config.repositories[name]
));

Aplenture.Commander.onMessage.on(message => log.write(message, 'commander'));
Aplenture.Command.onMessage.on((message, command) => log.write(message, command.constructor.name));
Aplenture.Database.onMessage.on((message, database) => log.write(message, database.name));
Aplenture.Server.onMessage.on((message, app) => log.write(message, app.name));
Aplenture.Server.onError.on((error, app) => log.error(error, app.name));
Aplenture.Server.onMessage.on((_, app) => {
    log.write(`add command '${Aplenture.Ping.name}'`, app.name);
    app.addCommand(Aplenture.Ping.name, Aplenture.Ping, config, context);

    log.write(`add command '${Aplenture.HasAccess.name}'`, app.name);
    app.addCommand(Aplenture.HasAccess.name, Aplenture.HasAccess, config, context);

    log.write(`add command '${Aplenture.RegisterUser.name}'`, app.name);
    app.addCommand(Aplenture.RegisterUser.name, Aplenture.RegisterUser, config, context);

    log.write(`add command '${Aplenture.LoginUser.name}'`, app.name);
    app.addCommand(Aplenture.LoginUser.name, Aplenture.LoginUser, config, context);

    log.write(`add command '${Aplenture.LogoutUser.name}'`, app.name);
    app.addCommand(Aplenture.LogoutUser.name, Aplenture.LogoutUser, config, context);

    log.write(`add command '${Aplenture.ChangeUserPassword.name}'`, app.name);
    app.addCommand(Aplenture.ChangeUserPassword.name, Aplenture.ChangeUserPassword, config, context);

    Object.keys(Commands).forEach(command => {
        log.write(`add command '${command}'`, app.name);
        app.addCommand(command, Commands[command], config, context);
    });
}, { args: 'init' });

commander.addCommand("start", Aplenture.StartServer, config, context);
commander.addCommand("changepw", Aplenture.ChangeUserPassword, config, context);
commander.addCommand("register", Aplenture.RegisterUser, config, context);
commander.addCommand("reset", Aplenture.ResetDatabase, config, context);
commander.addCommand("update", Aplenture.UpdateDatabase, config, context);

Object.keys(Commands).forEach(command => commander.addCommand(command, Commands[command], config, context));

(async function () {
    try {
        const result = await commander.executeLine(command);

        process.stdout.write(result.toString());
    } catch (error) {
        setTimeout(() => process.exit(error.code || -1), TIMEOUT_EXIT);
    }

    stopwatch.stop();
    log.write("runtime: " + Aplenture.formatDuration(stopwatch.duration, { seconds: true, milliseconds: true }));
})();