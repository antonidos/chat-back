const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const SETTINGS = require('./settings');

const app = express()
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", 
      credentials: true
    }
  });
const { HOST, PORT, DB_PATH } = SETTINGS;

const DB = require('./application/modules/DB/DB')
const UsersManager = require('./application/modules/users/UsersManager');
const Router = require('./application/routes/Router');

const db = new DB(DB_PATH)

const usersManager = new UsersManager({ db });

const router = new Router({ usersManager });

app.use(
    bodyParser.urlencoded({ extended: true }),
    express.static(__dirname + '/public')
);
app.use(bodyParser.json());
app.use(cors());

app.use('/', router);

const messagesHandler = require('./application/modules/socket/messagesEvents');
const connectionHandler = require('./application/modules/socket/connectionEvents')
const onConnection = (socket) => {
    messagesHandler(io, socket);
    connectionHandler(io, socket);
}

io.on("connection", onConnection);

server.listen(PORT, () => console.log(`Server running at port ${PORT}. ${HOST}`));