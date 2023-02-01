import * as FS from "fs";
import * as Commands from "./commands";
import * as Repositories from "./repositories";
import { AccessRepository, AccountRepository, ChangeUserPassword, Command, Commander, Database, formatDuration, HasAccess, Log, LoginUser, LogoutUser, Ping, RegisterUser, ResetDatabase, Server, ServerConfig, StartServer, Stopwatch, UpdateDatabase } from "aplenturejs";
import { Config } from "./models/config";
import { Context } from "./models/context";

const TIMEOUT_EXIT = 1000;

(async function () {
    const stopwatch = new Stopwatch();

    stopwatch.start();

    const infos: ServerConfig = JSON.parse(FS.readFileSync(process.env.PWD + '/package.json').toString());
    const log = Log.createFileLog(`${process.env.PWD}/${infos.name}.log`);

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
    const commander = new Commander();

    Object.keys(config.databases).forEach(name => {
        context.databases[name] = new Database(name, config.databases[name]);
        context.databases[name].init();
    });

    Commander.onMessage.on(message => log.write(message, 'commander'));
    Command.onMessage.on((message, command) => log.write(message, command.constructor.name));
    Database.onMessage.on((message, database) => log.write(message, database.name));
    Server.onMessage.on((message, app) => log.write(message, app.name));
    Server.onError.on((error, app) => log.error(error, app.name));
    Server.onMessage.on((_, server) => {
        server.addCommand(Ping.name, Ping, config, context);
        server.addCommand(HasAccess.name, HasAccess, config, context);
        server.addCommand(RegisterUser.name, RegisterUser, config, context);
        server.addCommand(LoginUser.name, LoginUser, config, context);
        server.addCommand(LogoutUser.name, LogoutUser, config, context);
        server.addCommand(ChangeUserPassword.name, ChangeUserPassword, config, context);

        Object.keys(Commands).forEach(command => server.addCommand(command, Commands[command], config, context));
    }, { args: 'init' });

    commander.addCommand("start", StartServer, config, context);
    commander.addCommand("changepw", ChangeUserPassword, config, context);
    commander.addCommand("register", RegisterUser, config, context);
    commander.addCommand("reset", ResetDatabase, config, context);
    commander.addCommand("update", UpdateDatabase, config, context);

    context.repositories[AccessRepository.name] = new AccessRepository(context.databases[config.repositories[AccessRepository.name].database], config.repositories[AccessRepository.name].table);
    context.repositories[AccountRepository.name] = new AccountRepository(context.databases[config.repositories[AccountRepository.name].database], config.repositories[AccountRepository.name].table);

    // add all src/repositories to context
    Object.keys(Repositories).forEach(name => {
        const c = config.repositories[name];

        if (!c)
            throw new Error(`missing repository config for '${name}'`);

        const database = context.databases[c.database];

        if (!database)
            throw new Error(`missing database '${c.database}' for '${name}'`);

        context.repositories[name] = new Repositories[name](database, c.table);
    });

    // add all src/commands to commander
    Object.keys(Commands).forEach(command => { commander.addCommand(command, Commands[command], config, context) });

    try {
        const result = await commander.executeLine(command);

        process.stdout.write(result.toString());
    } catch (error) {
        setTimeout(() => process.exit(error.code || -1), TIMEOUT_EXIT);
    }

    Object.values(context.databases).forEach(database => database.close());

    stopwatch.stop();

    log.write("runtime: " + formatDuration(stopwatch.duration, { seconds: true, milliseconds: true }));
    log.close();
})();