import * as Server from "serverjs";

export class HelloWorld extends Server.Command<any, any, any> {
    public readonly isPrivate = false;
    public readonly description = "Returns hello world.";
    public readonly property = null;

    public async execute(): Promise<Server.Response> {
        return new Server.TextResponse('hello world');
    }
}