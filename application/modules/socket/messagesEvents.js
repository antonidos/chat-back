module.exports = (io, socket) => {
    const sendMessage = (content, room, sender) => {
        socket.broadcast.emit(`message/${room}`, [content, sender])
    }

    socket.on('sendMessage', sendMessage)
}