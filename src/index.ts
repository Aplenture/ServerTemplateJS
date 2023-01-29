import * as FS from "fs";
import * as Foundation from "foundationjs";
import * as Server from "serverjs";
import * as Commands from "./commands";
import { Config, Context } from "./models";

const stopwatch = new Foundation.Stopwatch();

stopwatch.start();

const TIMEOUT_EXIT = 1000;

const infos: Server.AppConfig = JSON.parse(FS.readFileSync(process.env.PWD + '/package.json').toString());
const log = Server.Log.createFileLog(`${process.env.PWD}/${infos.name}.log`);

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
const commander = new Foundation.Commander();

Object.keys(config.databases).forEach(name => context.databases[name] = new Server.Database(name, config.databases[name]));
Object.keys(config.repositories).forEach(name => context.repositories[name] = Server.createInstance<Server.Repository<any>>(
    config.repositories[name].path,
    config.repositories[name].class,
    context.databases[config.repositories[name].database],
    config.repositories[name]
));

Foundation.Commander.onMessage.on(message => log.write(message, 'commander'));
Foundation.Command.onMessage.on((message, command) => log.write(message, command.constructor.name));
Server.Database.onMessage.on((message, database) => log.write(message, database.name));
Server.App.onMessage.on((message, app) => log.write(message, app.name));
Server.App.onError.on((error, app) => log.error(error, app.name));
Server.App.onMessage.on((_, app) => {
    log.write(`add command '${Server.Ping.name}'`, app.name);
    app.addCommand(Server.Ping.name, Server.Ping, config, context);

    log.write(`add command '${Server.HasAccess.name}'`, app.name);
    app.addCommand(Server.HasAccess.name, Server.HasAccess, config, context);

    log.write(`add command '${Server.RegisterUser.name}'`, app.name);
    app.addCommand(Server.RegisterUser.name, Server.RegisterUser, config, context);

    log.write(`add command '${Server.LoginUser.name}'`, app.name);
    app.addCommand(Server.LoginUser.name, Server.LoginUser, config, context);

    log.write(`add command '${Server.LogoutUser.name}'`, app.name);
    app.addCommand(Server.LogoutUser.name, Server.LogoutUser, config, context);

    log.write(`add command '${Server.ChangeUserPassword.name}'`, app.name);
    app.addCommand(Server.ChangeUserPassword.name, Server.ChangeUserPassword, config, context);

    Object.keys(Commands).forEach(command => {
        log.write(`add command '${command}'`, app.name);
        app.addCommand(command, Commands[command], config, context);
    });
}, { args: 'init' });

commander.addCommand("start", Server.StartServer, config, context);
commander.addCommand("changepw", Server.ChangeUserPassword, config, context);
commander.addCommand("register", Server.RegisterUser, config, context);
commander.addCommand("reset", Server.ResetDatabase, config, context);
commander.addCommand("update", Server.UpdateDatabase, config, context);

Object.keys(Commands).forEach(command => commander.addCommand(command, Commands[command], config, context));

(async function () {
    try {
        const result = await commander.executeLine(command);

        process.stdout.write(result.toString());
    } catch (error) {
        setTimeout(() => process.exit(error.code || -1), TIMEOUT_EXIT);
    }

    stopwatch.stop();
    log.write("execution duration: " + Foundation.formatDuration(stopwatch.duration, { seconds: true, milliseconds: true }));
})();