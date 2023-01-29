import * as Server from "serverjs";

export class MyCommand extends Server.Command<any, any, any> {
    public readonly isPrivate = false;
    public readonly description = "My description.";
    public readonly property = null;

    public execute(args: any): Promise<Server.Response> {
        throw new Error("Method not implemented.");
    }
}