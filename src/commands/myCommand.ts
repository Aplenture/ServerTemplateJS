import { Response, ServerCommand } from "aplenturejs";

export class MyCommand extends ServerCommand<any, any, any> {
    public readonly isPrivate = false;
    public readonly description = "My description.";
    public readonly property = null;

    public execute(args: any): Promise<Response> {
        throw new Error("Method not implemented.");
    }
}