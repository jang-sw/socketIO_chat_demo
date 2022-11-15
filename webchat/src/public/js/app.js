const socket = io();
const welcome = document.getElementById("welcome");
const room = document.getElementById("room");
const nickname = document.getElementById("nickname");
const nicknameForm = nickname.querySelector("form");


let roomname;
const addMsg = (msg) => {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = msg;
    ul.appendChild(li);
}
nicknameForm.addEventListener("submit",(e) => {
    e.preventDefault();
    const input = nicknameForm.querySelector("#nameInput");
    socket.emit("nickname", input.value, () =>{
        welcome.hidden = false;
        nickname.hidden = true;
        const welcomeForm = welcome.querySelector("form");
        welcomeForm.addEventListener("submit",(e) => {
            e.preventDefault();
            const input = welcomeForm.querySelector("input");
            socket.emit("room", input.value, (param, cnt) => {
                welcome.hidden = true;
                room.hidden = false;
                roomname = param;
                const h3 = room.querySelector("h3");
                h3.innerText = `Room ${roomname} (${cnt})`;
                const msgForm = room.querySelector("#msg");
                msgForm.addEventListener("submit", (e) =>{
                    e.preventDefault();
                    const input = room.querySelector("#msgInput");
                    socket.emit("msg", input.value, roomname, ()=> {
                        addMsg(`You : ${input.value}`);
                        input.value = "";
                    });
                })
            });
            input.value = "";
        });
    });
});

socket.on("welcome", (res, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomname} (${newCount})`;
    addMsg(`${res} enter`);
});

socket.on("bye", (res, newCount) => {
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomname} (${newCount})`;         
    addMsg(`${res} left`);
});
socket.on("msg", (msg) => {
    addMsg(msg);
});
socket.on("room_change", (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    if(rooms.length === 0){
        return;
    }
    rooms.forEach(v => {
        const li = document.createElement("li");
        li.innerText = v;
        roomList.append(li);
    });
});

