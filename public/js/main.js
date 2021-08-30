const socket = io();

const chatMessages = document.querySelector('.chat-messages');
const chatForm = document.getElementById('chat-form');

const roomName = document.getElementById('room-name');

const { username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

socket.emit("joinRoom", {username, room})

socket.on("message", (message) => {
    chatVM.outputMessage(message);

    chatMessages.scrollTop = chatMessages.scrollHeight
})

socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    usersListVM.outputUsers(users);
})

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;
    socket.emit("chatMessage", msg);

    e.target.elements.msg.value = "";
    e.target.elements.msg.focus();
})

function outputRoomName(room){
    roomName.innerText = room;
}

const chatVM = new Vue({
    el: ".chat-messages",
    data: {
        messages: []
    },
    methods: {
        outputMessage: function(message){
            this.messages.push(message);
        }
    }
})

const usersListVM = new Vue({
    el: "#users",
    data: {
        users: []
    },
    methods:{
        outputUsers: function(users){
            this.users = users;
        }
    }
})