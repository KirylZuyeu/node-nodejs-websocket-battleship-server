import { httpServer } from "./http_server/index";
import './ws';
import { HTTP_PORT } from './constants/constants';

httpServer.listen(HTTP_PORT, () => {
    console.log(`Start static http server on the ${HTTP_PORT} port!`);
});
