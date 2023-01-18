const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const SETTINGS = require('./settings');

const app = express()
const server = http.createServer(app);
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

server.listen(PORT, () => console.log(`Server running at port ${PORT}. ${HOST}`));