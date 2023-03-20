module.exports = (server) => {
    const io = require('socket.io')(server);
    let numUsers = 0;

    io.on('connection', (socket) => {
        let addedUser = false;
        socket.on('newMessage', data => {
            socket.broadcast.emit('newMessage', {
                username: socket.username,
                message: data,
                sessionId: socket.id,
            }
            );
        });

        socket.on('newUser', username => {
            if (addedUser)
                return;
            socket.username = username;
            addedUser = true;
            ++numUsers;

            io.sockets.emit('newUser', username);
            io.sockets.emit('userCount', numUsers);

        });

        socket.on('typing', () => {
            socket.broadcast.emit('typing', {
                username: socket.username,
                sessionId: socket.id
            })
        });

        socket.on('stopTyping', () => {
            socket.broadcast.emit('stopTyping', {
                sessionId: socket.id
            })
        });

        socket.on('disconnect', async () => {
            if (addedUser) {
                --numUsers;
                io.sockets.emit('userLeft', {
                    username: socket.username,
                    sessionId: socket.id
                });
                io.sockets.emit('userCount', numUsers);
            }
        });
    });
}