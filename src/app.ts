import Server from './server';

import dotenv from "dotenv";

dotenv.config();

const server = new Server(process.env.PORT);

server.start();
