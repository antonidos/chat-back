module.exports = (io, socket) => {
    const sendMessage = (content, room, sender) => {
        console.log(content, room, sender)
        socket.broadcast.emit(`message/${room}`, [content, sender, Math.floor(Date.now() / 1000)])
    }

    socket.on('sendMessage', sendMessage)
}