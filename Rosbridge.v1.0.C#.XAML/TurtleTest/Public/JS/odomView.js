﻿var url_odom = "ws://localhost:4649/neobot_odom";
var url_teleop = "ws://localhost:4649/neobot_teleop";

var output_odom;

var linVel = 1.0;
var angVel = Math.PI/2.0;

function init() {
    output_odom = document.getElementById("odometry_data");
    btn_forward = document.getElementById("button_move_forward");
    btn_forward.addEventListener("click", moveForward, false);
    btn_forward = document.getElementById("button_move_backward");
    btn_forward.addEventListener("click", moveBackward, false);
    btn_forward = document.getElementById("button_move_left");
    btn_forward.addEventListener("click", moveLeft, false);
    btn_forward = document.getElementById("button_move_right");
    btn_forward.addEventListener("click", moveRight, false);
    btn_forward = document.getElementById("button_dec_vel");
    btn_forward.addEventListener("click", decreaseVelocity, false);
    btn_forward = document.getElementById("button_inc_vel");
    btn_forward.addEventListener("click", increaseVelocity, false);
    doWebSocket_odom();
    websocket_teleop = new WebSocket(url_teleop);
    websocket_teleop.onopen = function (evt) {
        console.log("Connected");        
    };
    websocket_teleop.onmessage = function (evt) {
        console.log(evt.data);
    };
}

function decreaseVelocity() {
    linVel -= 0.1;
}

function increaseVelocity() {
    linVel += 0.1;
}

function sendTeleop(cmd) {
    //websocket_teleop = new WebSocket(url_teleop);    
    var teleop_msg = { command: cmd }
    /*
    websocket_teleop.onopen = function (evt) {
        console.log(JSON.stringify(teleop_msg, null, 2));
        websocket_teleop.send(JSON.stringify(teleop_msg, null, 2));        
    };
    websocket_teleop.onmessage = function (evt) {
        console.log(evt.data);
    };
    */
    
    websocket_teleop.send(JSON.stringify(teleop_msg, null, 2));
}

function doWebSocket_odom() {
    websocket = new WebSocket(url_odom);
    websocket.onopen = function (evt) {
        onOpen(evt)
    };
    websocket.onclose = function (evt) {
        onClose(evt)
    };
    websocket.onmessage = function (evt) {
        onMessage(evt)
    };
    websocket.onerror = function (evt) {
        onError(evt)
    };
}

function writeOdometry(message){
    var pre = document.createElement("p");
    pre.style.wordWrap = "break-word";
    pre.innerHTML = message;
    output_odom.appendChild(pre);
}

function send(message) {
    websocket.send(message);
}

function onOpen(evt) {
    send("Websocket rocks");
}

function onClose(evt) {
    //writeToScreen("DISCONNECTED");
}

function drawIndex(posX, posY, w, x, y, z, c_ctx, stroke_style) {
    roll = Math.atan2(2 * (w * x + y * z), 1 - 2 * (Math.pow(x, 2) + Math.pow(y, 2)));
    pitch = Math.asin(2 * (w * y - z * x));
    yaw = Math.atan2(2 * (w * z + x * y), 1 - 2 * (Math.pow(y, 2) + Math.pow(z, 2)));
    arrowLength = 40;
    dirX = Math.cos(yaw) * arrowLength;
    dirY = Math.sin(yaw) * arrowLength;
    c_ctx.beginPath();
    c_ctx.moveTo(posX, posY);
    c_ctx.lineTo(posX + dirX, posY + dirY);
    c_ctx.strokeStyle = stroke_style;
    c_ctx.lineWidth = 10;
    c_ctx.stroke();
}

function drawOdometry(x, y, ori_w, ori_x, ori_y, ori_z) {
    var c = document.getElementById("odometry_canvas");    
    var ctx = c.getContext("2d");
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.beginPath();
    scale = 10.0;
    radius = 10;
    offset_x = 100;
    offset_y = 50;
    currX = x * scale + offset_x;
    currY = y * scale + offset_y;
    ctx.arc(currX, currY, radius, 0, 2 * Math.PI);
    var odom_gradient = ctx.createLinearGradient(0, 0, c.width, 0);
    odom_gradient.addColorStop("0", "SlateBlue");
    odom_gradient.addColorStop("0.5", "MediumVioletRed");
    odom_gradient.addColorStop("1.0", "MidnightBlue");
    ctx.strokeStyle = odom_gradient;
    ctx.lineWidth = 3;
    ctx.stroke();
    drawIndex(currX, currY, ori_w, ori_x, ori_y, ori_z, ctx, odom_gradient);
}

function onMessage(evt) {
    // Parse odometry
    var odom_obj = JSON.parse(evt.data);
    // Output these data
    p1 = output_odom.getElementsByTagName("p");
    for (var i = 0; i < p1.length; i++) {
        output_odom.removeChild(p1[i]);
    }    
    writeOdometry("x: " + odom_obj.x);
    writeOdometry("y: " + odom_obj.y);
    writeOdometry("z: " + odom_obj.z);
    writeOdometry("ori_w: " + odom_obj.ori_w);
    writeOdometry("ori_x: " + odom_obj.ori_x);
    writeOdometry("ori_y: " + odom_obj.ori_y);
    writeOdometry("ori_z: " + odom_obj.ori_z);
    
    drawOdometry(odom_obj.x, odom_obj.y,
        odom_obj.ori_w, odom_obj.ori_x, odom_obj.ori_y, odom_obj.ori_z);
    websocket.close();
}

function onError(evt) {
    writeToScreen('<span style="color: red;">ERROR: ' + evt.data + '</span>');
}

function moveForward(evt) {
    sendTeleop("forward");
}

function moveBackward(evt) {
    sendTeleop("backward");
}

function moveLeft(evt) {
    sendTeleop("left");
}

function moveRight(evt) {
    sendTeleop("right");
}

window.setInterval(function () { doWebSocket_odom(); }, 1000);


window.addEventListener("load", init, false);