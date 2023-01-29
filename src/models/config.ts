import { DatabaseConfig, HTTPConfig, RepositoryConfig, ServerConfig } from "aplenturejs";

export interface Config extends ServerConfig {
    readonly Aplentures: readonly HTTPConfig[];
    readonly databases: NodeJS.ReadOnlyDict<DatabaseConfig>;
    readonly repositories: NodeJS.ReadOnlyDict<RepositoryConfig>;
}