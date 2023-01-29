import * as Aplenture from "aplenturejs";

export interface Context {
    readonly databases: NodeJS.Dict<Aplenture.Database>;
    readonly repositories: NodeJS.Dict<Aplenture.Repository<any>>;
}