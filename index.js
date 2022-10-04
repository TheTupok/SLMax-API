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

    io.to(socket.id).emit('groupList', JSON.stringify(groupList));
    io.to(socket.id).emit('getAllMessages', JSON.stringify(allMessages));

    socket.on('getGroupList', async term => {
        const filteredGroup = groupList.filter(group =>
            group.nameGroup.toLowerCase().includes(term.toLowerCase())
        );
        io.to(socket.id).emit('groupList', JSON.stringify(filteredGroup));
        const allMessages = await dbservice.getAllMessages();
        io.emit('getAllMessages', JSON.stringify(allMessages));
    });

    socket.on('sendMessage', async msg => {
        await dbservice.addMessageToDB(msg);
        const allMessages = await dbservice.getAllMessages();
        const getAllMessagesGroups = await dbservice.getAllMessagesGroups(
            socket.currentGroup
        );
        io.to(socket.currentGroup).emit(
            'getGroupMessage',
            JSON.stringify(getAllMessagesGroups)
        );
        io.emit('getAllMessages', JSON.stringify(allMessages));
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
