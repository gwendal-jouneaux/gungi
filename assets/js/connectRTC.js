const BASE_LINK = "https://demo.httprelay.io/link/gungi-";

// Create connexion
function createRTC(receiveMessage, callback) {
    dc1 = pc1.createDataChannel('test', {
        reliable: true
    })
    activedc = dc1
    dc1.onopen = function (e) { }
    dc1.onmessage = receiveMessage
    pc1.createOffer(function (desc) {
        pc1.setLocalDescription(desc, function () { }, function () { })
    }, function () { }, sdpConstraints)

    $.get(BASE_LINK + $('#passcode').val() + "-answer").done(function (data) {
        console.log(data)
        var answerDesc = new RTCSessionDescription(JSON.parse(data))
        pc1.setRemoteDescription(answerDesc);
        callback()
    })
};

// Join connexion
function joinRTC(receiveMessage, callback) {
    $.get(BASE_LINK + $('#passcode').val() + "-offer").done(function (data) {
        console.log(data)
        var offerDesc = new RTCSessionDescription(JSON.parse(data))
        pc2.setRemoteDescription(offerDesc)
        pc2.createAnswer(function (answerDesc) {
            pc2.setLocalDescription(answerDesc)
        },
            function () { },
            sdpConstraints)
    })
    pc2.connectCallback = callback
    pc2.receiveMessage = receiveMessage
};


function sendJSON(data){
    var message = JSON.stringify(data);
    activedc.send(message);
}


if (navigator.webkitGetUserMedia) {
    RTCPeerConnection = webkitRTCPeerConnection
}

var cfg = {
    'iceServers': [{
        'url': "stun:stun.l.google.com:19302"
    }]
},
    con = {
        'optional': [{
            'DtlsSrtpKeyAgreement': true
        }]
    }

var pc1 = new RTCPeerConnection(cfg, con),
    dc1 = null,
    activedc = false;

var sdpConstraints = {
    optional: [],
}

pc1.onicecandidate = function (e) {
    if (e.candidate == null) {
        let offer = JSON.stringify(pc1.localDescription);
        $.post(BASE_LINK + $('#passcode').val() + "-offer", offer);
    }
}

var pc2 = new RTCPeerConnection(cfg, con),
    dc2 = null;

pc2.ondatachannel = function (e) {
    var datachannel = e.channel || e;
    dc2 = datachannel
    activedc = dc2
    dc2.onopen = function (e) { }
    dc2.onmessage = pc2.receiveMessage
}

pc2.onicecandidate = function (e) {
    if (e.candidate == null) {
        let answer = JSON.stringify(pc2.localDescription);
        $.post(BASE_LINK + $('#passcode').val() + "-answer", answer).done(pc2.connectCallback);
    }
}