import { httpServer } from "./http_server/index";

const HTTP_PORT = 8181;
const WS_PORT = 3000;

console.log(`Start static http server on the ${HTTP_PORT} port!`);
console.log(`WebSocketServer works on port ${WS_PORT}.`);
httpServer.listen(HTTP_PORT);
