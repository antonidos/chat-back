module.exports = (io, socket) => {
    const joinChat = (chatId) => {
        socket.emit('online', chatId)
    }

    const leaveChat = (chatId) => {
        socket.emit('offline', chatId)
    }

    socket.on('join', joinChat);
    socket.on('disconnect', leaveChat)
}