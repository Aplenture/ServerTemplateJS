import * as Server from "serverjs";

export interface Config extends Server.AppConfig {
    readonly servers: readonly Server.ServerConfig[];
    readonly databases: NodeJS.ReadOnlyDict<Server.DatabaseConfig>;
    readonly repositories: NodeJS.ReadOnlyDict<Server.RepositoryConfig>;
}