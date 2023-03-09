import { CommandArgs, Response, ServerCommand } from "aplenturejs";

interface Config {
}

interface Context {
    readonly repositories: {
    }
}

interface Args {
}

export class MyCommand extends ServerCommand<Config, Context, Args> {
    public readonly isPrivate = false;
    public readonly description = "My description.";
    public readonly property = new CommandArgs<Args>(
    );

    public execute(args: Args): Promise<Response> {
        throw new Error("Method not implemented.");
    }
}