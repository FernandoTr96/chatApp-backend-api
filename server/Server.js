const express = require('express');
const {createServer} = require('http');
const socketio = require('socket.io');
const path = require('path');
const cors = require('cors');
require('dotenv').config();
const socketController = require('../sockets/socketController');
const dbConnection = require('../db/dbConnection');

class Server{

    constructor(){
        this.port = process.env.PORT || 8000;
        this.app = express();
        this.socketApp = createServer(this.app);
        this.io = socketio(this.socketApp);
        this.db_connection();
        this.middlewares();
        this.routes();
        this.sockets();
    }

    listen(){
        this.socketApp.listen(this.port, ()=> console.log(`[socketServer] Listen port ${this.port}`));
    }

    db_connection(){
        dbConnection();
    }

    middlewares(){
        this.app.use(express.static(path.join(__dirname, '../public')));
        this.app.use(cors());
        this.app.use(express.json());
    }

    routes(){
        this.app.use('/api/auth',require('../routes/authRoutes'));
        this.app.use('/api/chat',require('../routes/chatRoutes'));
        this.app.use('/api/user',require('../routes/userRoutes'));
    }

    sockets(){
        new socketController(this.io);
    }

}

module.exports = Server;