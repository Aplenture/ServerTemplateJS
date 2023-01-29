import { Database, Repository } from "aplenturejs";

export interface Context {
    readonly databases: NodeJS.Dict<Database>;
    readonly repositories: NodeJS.Dict<Repository>;
}