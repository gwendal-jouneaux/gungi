const gungi = new window.Gungi();

let you = {
    endedDraft: false
}
let other = {
    endedDraft: false
}

// piece types
const pieces = [{
        name: "Marshall",
        kanji: "帥",
        number: 0
    },
    {
        name: "Major General",
        kanji: "小",
        number: 1
    },
    {
        name: "Lieutenant General",
        kanji: "中",
        number: 2
    },
    {
        name: "General",
        kanji: "大",
        number: 3
    },
    {
        name: "Archer",
        kanji: "弓",
        number: 4
    },
    {
        name: "Knight",
        kanji: "馬",
        number: 5
    },
    {
        name: "Musketeer",
        kanji: "筒",
        number: 6
    },
    {
        name: "Captain",
        kanji: "謀",
        number: 7
    },
    {
        name: "Samurai",
        kanji: "侍",
        number: 8
    },
    {
        name: "Fortress",
        kanji: "砦",
        number: 9
    },
    {
        name: "Cannon",
        kanji: "砲",
        number: 10
    },
    {
        name: "Spy",
        kanji: "忍",
        number: 11
    },
    {
        name: "Pawn",
        kanji: "兵",
        number: 12
    }
];

function getPieceImg(number, color) {
    return `<img class="piece" title="${pieces[number].name}" data="${pieces[number].kanji}" src="./assets/img/${number}-${color}.png">`;
}

function pieceFromKanji(kanji) {
    for (let i = 0; i < pieces.length; i++) {
        const piece = pieces[i];
        if (piece.kanji == kanji) return piece;
    }
}

function listOfPiecesToHTML(list) {
    let html = ""
    for (let i = 0; i < list.length; i++) {
        const element = list[i];
        let amount = element.amount;
        let gungiPiece = element.piece;
        let piece = pieceFromKanji(gungiPiece.type);
        for (let j = 0; j < amount; j++) {
            html += getPieceImg(piece.number, gungiPiece.color);
        }
    }
    return html
}

function updateGame() {
    let yourStock = gungi.stockpile(you.color);
    let yourCapture = gungi.captured(you.color);
    let otherStock = gungi.stockpile(other.color);
    let otherCapture = gungi.captured(other.color);

    yourStockBox.innerHTML = listOfPiecesToHTML(yourStock);
    yourCaptureBox.innerHTML = listOfPiecesToHTML(yourCapture);
    otherStockBox.innerHTML = listOfPiecesToHTML(otherStock);
    otherCaptureBox.innerHTML = listOfPiecesToHTML(otherCapture);

    let tColor = getPieceImg(0, gungi.turn())
    turnColor.innerHTML = `<span class="content">${tColor}</span>`;

    draftEnd.disable = gungi.turn() == other.color;

    checkmate.innerHTML = "<p>Check : <b>" + gungi.in_check() + "</b></p>";
    checkmate.innerHTML += "<p>Checkmate : <b>" + gungi.in_checkmate() + "</b></p>";
    checkmate.innerHTML += "<p>Stalemate : <b>" + gungi.in_stalemate() + "</b></p>";

    armies.innerHTML = "<p>Your Army : <b>" + (38 - yourCaptureBox.children.length - yourStockBox.children.length) + "</b></p>";
    armies.innerHTML += "<p>Other Army : <b>" + (38 - otherCaptureBox.children.length - otherStockBox.children.length) + "</b></p>";

    $("#phase b").html(gungi.phase())
    if (other.endedDraft) {
        if (you.endedDraft) {
            $("#phase span").html("");
        } else {
            $("#phase span").html(`(${other.name} is waiting)`);
        }
    }

    let ranks = gungi.board();
    for (let rank = 1; rank <= ranks.length; rank++) {
        const files = ranks[9 - rank];
        for (let file = 1; file <= files.length; file++) {
            const cell = files[file - 1];
            let tableCellDetail = $("td#" + rank + "-" + file + " .detailed");
            let tableCellContent = $("td#" + rank + "-" + file + " .content");
            tableCellDetail.html("");
            tableCellContent.html("");
            for (let tier = 1; tier <= cell.length; tier++) {
                const gungiPiece = cell[tier - 1];
                if (gungiPiece == null) {
                    break;
                }
                let piece = pieceFromKanji(gungiPiece.type);
                let img = getPieceImg(piece.number, gungiPiece.color)
                let toAdd = `<div><span>${tier}</span>${img}</div>`
                let old = tableCellDetail.html();
                tableCellDetail.html(toAdd + old);
                tableCellContent.html(img);
            }
        }
    }
}

function receiveMessage(e) {
    const data = JSON.parse(e.data)
    switch (data.type) {
        case "CHAT":
            let user = data.user;
            let message = data.message;
            chat.innerHTML += "<p><b>" + user + "</b> : " + message + "</p>";
            break;

        case "NAME":
            other.name = data.name;
            if (you.name) {
                displayColorChoice();
            }
            break;

        case "COLOR":
            other.color = data.color;
            updateColorChoice();
            break;

        case "READY":
            you.color = data.color;
            initGame();
            break;

        case "PLAY":
            let move = data.move;
            gungi.move(move);
            updateGame();
            break;

        default:
            break;
    }
}

window.onload = function() {
    sendChat.onclick = function() {
        let data = {};
        data.type = "CHAT"
        data.user = you.name;
        data.message = msgChat.value
        chat.innerHTML += "<p><b>" + you.name + "</b> : " + msgChat.value + "</p>";
        msgChat.value = "";
        sendJSON(data);
    }

    createBtn.onclick = function() {
        createBtn.disabled = true;
        joinBtn.disabled = true;
        createRTC(receiveMessage, function() {
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

    joinBtn.onclick = function() {
        createBtn.disabled = true;
        joinBtn.disabled = true;
        joinRTC(receiveMessage, function() {
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

    nameBtn.onclick = function() {
        nameBtn.disabled = true;
        let data = {};
        data.type = "NAME";
        you.name = user.value
        data.name = you.name;
        sendJSON(data);
        if (other.name) {
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

    colorValidationBtn.onclick = function() {
        if (other.color && you.color && other.color != you.color) {
            blackBtn.disabled = true;
            whiteBtn.disabled = true;
            colorValidationBtn.disabled = true;
            let data = {};
            data.type = "READY";
            data.color = other.color;
            sendJSON(data);
            initGame();
        }
    }

    draftEnd.onclick = function() {
        if (gungi.turn() == you.color) {
            let data = {};
            data.type = "PLAY";
            data.move = {
                src: null,
                dst: null,
                type: gungi.READY
            };
            let worked = gungi.move(data.move);
            if (worked) {
                you.endedDraft = true;
                draftEnd.disabled = true;
                sendJSON(data);
                updateGame()
            }
        }
    }

    $("#board").on("click", "td:not(.piece-target)", function() {
        if (gungi.turn() == you.color) {
            selectPiece($(this), "BOARD")
        }
    });

    $("#yourStockBox").on("click", "img.piece", function() {
        if (gungi.turn() == you.color) {
            selectPiece($(this), "STOCK")
        }
    });

    $("#board").on("click", ".piece-target", function() {
        if (gungi.turn() == you.color) {
            let moveIndex = $(this).attr("move-index");
            let attackIndex = $(this).attr("attack-index");
            if (moveIndex && attackIndex) {
                attack.onclick = function() {
                    let move = window.possibleMoves[attackIndex];
                    let worked = gungi.move(move);
                    if (worked) {
                        let data = {};
                        data.type = "PLAY";
                        data.move = move;
                        sendJSON(data);
                        unselectAll()
                        updateGame();
                    }
                }
                stack.onclick = function() {
                    let move = window.possibleMoves[moveIndex];
                    let worked = gungi.move(move);
                    if (worked) {
                        let data = {};
                        data.type = "PLAY";
                        data.move = move;
                        sendJSON(data);
                        unselectAll()
                        updateGame();
                    }
                }
                $("#actionChooserTrigger").click();
                return;
            }
            let move = window.possibleMoves[moveIndex ? moveIndex : attackIndex];
            let worked = gungi.move(move);
            if (worked) {
                let data = {};
                data.type = "PLAY";
                data.move = move;
                sendJSON(data);
                unselectAll()
                updateGame();
            }

        }
    });

    $("#game #board td").hover(function() {
        let detail = $(this).find(".detailed")
        let empty = detail.get()[0].children.length == 0;
        if (!empty) {
            detail.css("display", "block");
        }
    }, function() {
        $(this).find(".detailed").css("display", "none")
    });
}

function selectPiece(elem, location) {
    if (elem.hasClass("piece-selection")) {
        unselectAll()
        return;
    }
    $(".piece-selection").removeClass("piece-selection");
    elem.addClass("piece-selection");
    cleanPossibleMoves();

    window.possibleMoves = []
    switch (location) {
        case "BOARD":
            possibleMoves = gungi.moves({
                square: elem.attr("id")
            });
            break;
        case "STOCK":
            possibleMoves = gungi.moves({
                stock_piece: elem.attr("data")
            });
            break;
    }
    for (let i = 0; i < possibleMoves.length; i++) {
        const move = possibleMoves[i];
        if (move.dst) {
            $("#" + move.dst).addClass("piece-target");
            switch (move.type) {
                case gungi.MOVEMENT:
                    $("#" + move.dst).attr("move-index", i);
                    break;
                case gungi.PLACE:
                    $("#" + move.dst).attr("move-index", i);
                    break;
                case gungi.STACK:
                    $("#" + move.dst).attr("move-index", i);
                    break;
                case gungi.ATTACK:
                    $("#" + move.dst).attr("attack-index", i);
                    break;
            }
        }
    }
}

function cleanPossibleMoves() {
    $(".piece-target").removeClass("piece-target");
    $("[move-index]").removeAttr("move-index")
    $("[attack-index]").removeAttr("attack-index")
}

function unselectAll() {
    $(".piece-selection").removeClass("piece-selection");
    cleanPossibleMoves()
}

function initGame() {
    if (you.color == 'b') {
        let numbers = document.querySelectorAll("#board .board-numbers .content");
        for (let i = 0; i < numbers.length; i++) {
            const value = numbers[i].innerHTML;
            const newValue = 10 - parseInt(value);
            numbers[i].innerHTML = "" + newValue
        }
    }
    let lines = board.children[0].children
    for (let rank = 1; rank < lines.length; rank++) {
        const line = lines[rank];
        const cells = line.children
        for (let file = 1; file < cells.length; file++) {
            const cell = cells[file];
            let cellRank = 10 - rank
            let cellFile = file
            if (you.color == 'b') {
                cellRank = 10 - cellRank
                cellFile = 10 - cellFile
            }
            cell.id = "" + cellRank + "-" + cellFile;
        }
    }
    updateGame()
    color.style.display = "none";
    game.style.display = "flex";
}

function displayColorChoice() {
    username.style.display = "none";
    color.style.display = "block";
    colorValidationBtn.disabled = you.client;
    updateColorChoice()
}

function updateColorChoice() {
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