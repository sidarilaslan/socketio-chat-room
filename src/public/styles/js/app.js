const userTitleColorList = [{
    id: "",
    hexValue: ""
}];
const COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7',
    '#09cf6a', '#668096', '#22b9a8', '#ff00a1'
];
let typingTimer;
let connected = false;
const TYPING_TIMER_LENGTH = 600;
const username = sessionStorage.getItem("username");
if (!username)
    location.href = "/";

const socket = io();
const $messageText = $("#messageText");
const $messageArea = $("#messageArea");
const $userList = $("#userList");
$messageText.focus();

socket.emit("newUser", username);

socket.on("newUser", (username) => {
    connected = true;
    log(username, { classes: "userJoined", logMessage: "Katıldı!" });

});

socket.on("userLeft", (data) => {
    log(data.username, { classes: "userleft", logMessage: "Ayrıldı!" });
    removeChatTyping(data.sessionId);
});

socket.on("userCount", (count) => {
    $("#activeUser").text(`${count} Aktif Kullanıcı`);
})

socket.on("typing", (data) => {
    if ($('#' + data.sessionId).length == 0) {
        let div = `<div id=${data.sessionId} class="writing">${data.username} <img src="../styles/img/writing.gif"></div>`;
        $messageArea.append(div);
    }
});

socket.on("stopTyping", (data) => {
    removeChatTyping(data.sessionId);
});

socket.on("newMessage", data => {
    displayMessage(data);
});

socket.on('disconnect', () => {
    connected = false;
    log("Bağlantı koptu");
});

socket.io.on('reconnect', () => {
    socket.emit('newUser', username);
    log("Tekrar bağlanıldı");
});

socket.io.on('reconnect_error', () => {
    log("yeniden bağlanma başarısız");
});

$("#messageText").keydown(e => {
    let isSent = false;
    if (e.key === "Enter" || e.keyCode === 13) {
        let message = $messageText.val();
        if (isEmpty(message))
            return;
        message = cleanInput(message);
        displayMessage(message, true);
        $messageText.val("");

        if (connected) {
            socket.emit("newMessage", message);
            isSent = true;
        }
    }

    socket.emit("typing");
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        socket.emit("stopTyping");
    }, TYPING_TIMER_LENGTH);

    if (isSent)
        socket.emit("stopTyping");
});

const log = (data, options = { classes: "", logMessage: "" }) => {
    let div = `<div class="${options.classes} log"><span>${data} ${options.logMessage}</span></div>`;
    $messageArea.append(div);
}

const displayMessage = (data, isClient = false) => {
    let sendTime = new Date().toLocaleTimeString("TR-tr", { hour: '2-digit', minute: '2-digit' });
    let $div = $();
    if (isClient) {
        $div = $(`<div class="msg sent">
        <span>${data}</span>`);
    }
    else {
        $div = $(`<div class="msg rcvd" ><div class=userTitle  style="color:${createUserTitleColor(data.sessionId)};">~${data.username}</div>
        <span>${data.message}</span>`);
    }

    let $sendTimeDiv = $(`<div class="sendTime">${sendTime}</div>`);
    $div.append($sendTimeDiv);
    $messageArea.append($div);

    updateScroll();
}

const updateScroll = () => {
    $messageArea[0].lastChild.scrollIntoView();
}

const isEmpty = (str) => {
    return !str.trim().length;
}

const createUserTitleColor = (id) => {
    let userTitleColor = userTitleColorList.find(e => e.id == id);
    if (!userTitleColor) {

        let hexValue = COLORS[Math.floor(Math.random() * COLORS.length)];

        userTitleColorList.push({ id: id, hexValue: hexValue });
        return hexValue;
    }
    return userTitleColor.hexValue;
}

const cleanInput = (input) => {
    return $('<div>').text(input).html();
}

const removeChatTyping = (id) => {
    $("#" + id).remove();
}

