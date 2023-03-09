import * as chai from 'chai';
import { expect } from "chai";
import { Server } from "aplenturejs";

chai.use(require("chai-as-promised"));

const server = new Server({
    debug: true,
    clearLog: true
});

describe("API", () => {
    describe("Info", () => {
        it("returns server infos", async () => expect(await server.executeLine("info")).includes(server.name));
    });
}).beforeAll(async () => {
    await server.init();
    await server.execute("reset");
}).afterAll(async () => {
    await server.stop();
});