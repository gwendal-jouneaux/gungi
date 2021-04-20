//import { Gungi } from './gungi.js';
//const gungi = new Gungi();

let you = {}
let other = {}

function receiveMessage(e){
    const data = JSON.parse(e.data)
    switch (data.type) {
        case "NAME":
            other.name = data.name
            if(you.name){
                displayColorChoice()
            }
            break;

        case "COLOR":
            other.color = data.color
            updateColorChoice()
            break;
    
        case "READY":
            you.color = data.color
            color.style.display = "none";
            game.style.display = "flex";
            break;
    
        default:
            break;
    }
}

window.onload = function (){
    createBtn.onclick = function (){
        createBtn.disabled = true;
        joinBtn.disabled = true;
        createRTC(receiveMessage, function(){
            connectInfos.innerHTML = "Connected";
            connect.style.display = "none";
            username.style.display = "block";
            you.server = true;
            you.client = false;
            other.server = false;
            other.client = true;
        });
        connectInfos.innerHTML = "Connecting ...";
    }

    joinBtn.onclick = function (){
        createBtn.disabled = true;
        joinBtn.disabled = true;
        joinRTC(receiveMessage, function(){
            connectInfos.innerHTML = "Connected";
            connect.style.display = "none";
            username.style.display = "block";
            other.server = true;
            other.client = false;
            you.server = false;
            you.client = true;
        });
        connectInfos.innerHTML = "Connecting ...";
    }

    nameBtn.onclick = function(){
        nameBtn.disabled = true;
        let data = {};
        data.type = "NAME";
        you.name = user.value
        data.name = you.name;
        sendJSON(data);
        if(other.name){
            displayColorChoice()
        }
    }

    blackBtn.onclick = function() {
        let data = {};
        data.type = "COLOR";
        data.color = "b";
        you.color = "b";
        sendJSON(data);
        updateColorChoice()
    }

    whiteBtn.onclick = function() {
        let data = {};
        data.type = "COLOR";
        data.color = "w";
        you.color = "w";
        sendJSON(data);
        updateColorChoice()
    }

    colorValidationBtn.onclick = function(){
        if(other.color && you.color && other.color != you.color)
        blackBtn.disabled = true;
        whiteBtn.disabled = true;
        colorValidationBtn.disabled = true;
        let data = {};
        data.type = "READY";
        data.color = other.color;
        sendJSON(data);
        color.style.display = "none";
        game.style.display = "flex";
    }
}

function displayColorChoice(){
    username.style.display = "none";
    color.style.display = "block";
    colorValidationBtn.disabled = you.server;
    updateColorChoice()
}

function updateColorChoice(){
    let black = "<p>"
    let nope = "<p>"
    let white = "<p>"
    switch (you.color) {
        case "b":
            black += you.name + "<br>"
            break;
        case "w":
            white += you.name + "<br>"
            break;
        default:
            nope += you.name + "<br>"
            break;
    }
    switch (other.color) {
        case "b":
            black += other.name
            break;
        case "w":
            white += other.name
            break;
        default:
            nope += other.name
            break;
    }
    black += "</p>"
    nope += "</p>"
    white += "</p>"
    blackPlayers.innerHTML = black
    nopePlayers.innerHTML = nope
    whitePlayers.innerHTML = white
}