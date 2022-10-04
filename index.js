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
    const allMessages = await dbservice.getAllMessages();
    const groupList = await dbservice.getAllGroup();

    io.emit('groupList', JSON.stringify(groupList));
    io.emit('getAllMessages', JSON.stringify(allMessages));

    socket.on('sendMessage', async msg => {
        await dbservice.addMessageToDB(msg);
        const allMessages = await dbservice.getAllMessages();
        const getAllMessagesGroups = await dbservice.getAllMessagesGroups(
            socket.currentGroup
        );
        io.emit('getAllMessages', JSON.stringify(allMessages));
        io.to(socket.currentGroup).emit(
            'getGroupMessage',
            JSON.stringify(getAllMessagesGroups)
        );
    });

    socket.on('currentGroup', async data => {
        socket.leave(socket.currentGroup);
        socket.join(data.nameGroup);
        socket.currentGroup = data.nameGroup;
        const allMessagesGroup = await dbservice.getAllMessagesGroups(
            socket.currentGroup
        );
        io.to(socket.id).emit(
            'getGroupMessage',
            JSON.stringify(allMessagesGroup)
        );
    });
});

http.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));
