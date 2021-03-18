const io = require("socket.io")(3000);

io.of("/screen").on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        socket.to(roomId).emit('user-connected', userId)

        socket.on("offer", (to, from, signal) => {
            io.of("/screen").to(to).emit("offer", from, signal)
        })

        socket.on("answer", (to, from, signal) => {
            io.of("/screen").to(to).emit("answer", from, signal)
        })

        socket.on("ice-candidate", (to, from, candidate) => {
            io.of("/screen").to(to).emit("ice-candidate", from, candidate)
        })

        socket.on("stop-stream", () => {
            socket.to(roomId).emit("stop-stream", socket.id)
        })

        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId)
        })
    })
})

const registry = {}

io.of('/files').on('connect', socket => {
    // console.log('client connected with id: ', socket.id)
    socket.on('disconnect', () => {
        // console.log('client disconnected with id: ', socket.id)
        delete registry[socket.id]
        io.of('/files').emit('users', registry)
    })

    socket.on('register', (name) => {
        registry[socket.id] = { id: socket.id, name: name }
        // console.log('user registered with id: ', socket.id)
        // console.log(registry)
        io.of('/files').emit('users', registry)
    })

    socket.on('offer', (to, offer) => {
        // console.log("forwading offer");
        io.of('/files').to(to).emit('offer', socket.id, offer)
    })

    socket.on('answer', (to, answer) => {
        // console.log("forwading answer");
        io.of('/files').to(to).emit('answer', socket.id, answer)
    })

    socket.on('candidate', (to, candidate) => {
        // console.log("forwading candidate");
        io.of('/files').to(to).emit('candidate', socket.id, candidate)
    })

})