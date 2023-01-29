import * as Aplenture from "aplenturejs";

export interface Config extends Aplenture.ServerConfig {
    readonly Aplentures: readonly Aplenture.HTTPConfig[];
    readonly databases: NodeJS.ReadOnlyDict<Aplenture.DatabaseConfig>;
    readonly repositories: NodeJS.ReadOnlyDict<Aplenture.RepositoryConfig>;
}