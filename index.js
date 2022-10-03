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
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

    socket.on('currentGroup', async data => {
        socket.currentGroup = data;
        const allMessages = await dbservice.getAllMessages(socket.currentGroup);
        io.emit('getAllMessages', JSON.stringify(allMessages));
    });

    const allMessages = await dbservice.getAllMessages(socket.currentGroup);
    io.emit('getAllMessages', JSON.stringify(allMessages));

    socket.on('sendMessage', async msg => {
        await dbservice.addMessageToDB(msg);
        const allMessages = await dbservice.getAllMessages(socket.currentGroup);
        io.emit('getAllMessages', JSON.stringify(allMessages));
    });
});

http.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
