const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const path = require('path');
const SETTINGS = require('./settings');

const app = express()
const { HOST, DB_PATH } = SETTINGS;

// const DB = require('./application/modules/DB/')