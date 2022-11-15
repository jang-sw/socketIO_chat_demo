const express = require('express');
const app = express();
const http = require('http');
const SocketIO = require('socket.io'); 

app.set('view engine', "pug");
app.set('views',__dirname + "/views");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use("/public", express.static(__dirname + "/public"))

app.get('/', (req, res) => {
    res.render('home')
})
app.get('/*', (req, res) => {
    res.redirect('/')
})

const httpServer = http.createServer(app);
const io = SocketIO(httpServer);

const publicRooms = () => {
    const {sockets : {adapter : {sids, rooms}} } = io;
    const publicRooms = [];
    rooms.forEach( (v,k) => {
        sids.get(k) === undefined ? publicRooms.push(`${k} (${countRoom(k)})`) : "do not";
    });
    return publicRooms;
};

const countRoom = (roomName) => {
    return io.sockets.adapter.rooms.get(roomName)?.size;
}

io.on("connection",socket => {
    socket["nickname"] = "Anon";
    socket.onAny((e) => {
        console.log(`socket Evnent ${e}`);
    });
    socket.on("room", (roomName, done) => {
        socket.join(roomName);
        done(roomName, countRoom(roomName));
        socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName));
        io.sockets.emit("room_change", publicRooms());
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach(room => {
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
        });
    });
    socket.on("disconnect",()=>{
        io.sockets.emit("room_change", publicRooms());
    });
    socket.on("msg", (msg, room, done) => {
        socket.to(room).emit("msg", `${socket.nickname} :  ${msg}`);
        done();
    });
    socket.on("nickname", (nickname, done) => {
        socket["nickname"] = nickname;
        done();
    });
});

httpServer.listen(3000, () => {
    console.log(`3000 port start`);
});