const PORT = 5000;

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const DatabaseService = require('./core/services/database-service');
const io = require('socket.io')(http, {
    cors: {
        origins: ['http://localhost:4200'],
    },
});

const dbservice = new DatabaseService();

io.on('connection', async socket => {
    console.log('New user connected');
    const allMessages = await dbservice.getAllMessages();
    io.emit('getallmessages', JSON.stringify(allMessages));

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('send message', async msg => {
        const { message, userName } = msg;
        await dbservice.addMessageToDB(message, userName);
        const allMessages = await dbservice.getAllMessages();
        io.emit('getallmessages', JSON.stringify(allMessages));
    });
});

http.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
