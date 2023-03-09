import { Server } from "aplenturejs";

const server = new Server();

server
    .init()
    .then(() => server.executeCommandLine())
    .then(output => process.stdout.write(output))
    .then(() => server.stop());