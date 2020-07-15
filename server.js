var app = require('express')();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(5000, '0.0.0.0');

connections = []

let userTimes = {}

console.log("server running");

io.sockets.on('connection', function(socket) {
    connections.push(socket);
    console.log('Connected: %s sockets connected', connections.length);

    userTimes[socket.id] = 0;

    /*
    socket.on('sendTime', time => {
        userTimes[socket.id] = time;
        console.log(socket.id + " " + time)
    });
    */

    socket.on('disconnect', function() {
        var i = connections.indexOf(socket);
        connections.splice(i, 1);
        console.log('Connected: %s sockets connected', connections.length);
    });
});

app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/yikes.html');
});

/*
setInterval(function() {
    io.sockets.emit('requestTime');
    let sum;
    Object.keys(userTimes).forEach(function(socket) {
        sum += userTimes[socket];
    });

    let average = sum / userTimes.length;
    let total = 0;

    Object.keys(userTimes).forEach(function(socket) {

        let v = Math.pow(parseFloat(userTimes[socket])-average),2);
        total += v;
    });

    console.log(Math.sqrt(total / userTimes.length))

}, 5000);
*/

app.post('/', function (req, res) {

    let hour = 0
    let minutes = 0
    let seconds = 0

    if(req.body.hour !== "") {
        hour = parseInt(req.body.hour)
    }

    if(req.body.minutes !== "") {
        minutes = parseInt(req.body.minutes)
    }

    if(req.body.seconds !== "") {
        seconds = parseInt(req.body.seconds)
    }

    if(req.body.syncreq === 'Pause') {
        io.sockets.emit('pause');
    }
    else if(req.body.syncreq === 'Play') {
        io.sockets.emit('play');
    }
    else if(req.body.syncreq === 'Sync') {
        let time = (hour * 3600) + (minutes * 60)  + seconds;
        io.sockets.emit('sync', time);
    }
    else {
    }
    res.sendFile(__dirname + '/yikes.html');
});