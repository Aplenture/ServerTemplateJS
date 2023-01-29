import * as Aplenture from "aplenturejs";

export class MyCommand extends Aplenture.ServerCommand<any, any, any> {
    public readonly isPrivate = false;
    public readonly description = "My description.";
    public readonly property = null;

    public execute(args: any): Promise<Aplenture.Response> {
        throw new Error("Method not implemented.");
    }
}