import * as Server from "serverjs";

export interface Context {
    readonly databases: NodeJS.Dict<Server.Database>;
    readonly repositories: NodeJS.Dict<Server.Repository<any>>;
}