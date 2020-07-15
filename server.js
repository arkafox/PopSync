var app = require('express')();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
var server = require('http').createServer(app);
var io = require('socket.io')(server);
server.listen(5000, '0.0.0.0');

var connectionsBrowser = []
var connectionsPopcorn = []

var connectionsName = {};

let connectionsTimes = {}

console.log("server running");

io.sockets.on('connection', function(socket) {

    connectionsPopcorn.push(socket.id)

    console.log('Connected: %s sockets connected', connectionsPopcorn.length + connectionsBrowser.length);

    connectionsTimes[socket.id] = 0;

    socket.on('browserMessage', id => {
        connectionsPopcorn.splice(connectionsPopcorn.indexOf(id), 1);
        connectionsBrowser.push(id);
    });

    socket.on('time', time => {
        connectionsTimes[socket.id] = time;
    })

    
    socket.on('namesend', name => {
        connectionsName[socket.id] = name;
    });

    socket.on('disconnect', function() {
        if(connectionsBrowser.includes(socket.id)) {
            var i = connectionsBrowser.indexOf(socket.id);
            connectionsBrowser.splice(i, 1);
            console.log('Browser disconnect!');
        }
        else {
            var i = connectionsPopcorn.indexOf(socket.id);
            connectionsPopcorn.splice(i, 1);
            console.log("Popcorn disconnect!")
        }
        
    });
});

function getTimes() {
    io.sockets.emit('requesttime');
}

setInterval(getTimes, 1000);

app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

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
    res.sendFile(__dirname + '/index.html');
});

function decycle(obj, stack = []) {
    if (!obj || typeof obj !== 'object')
        return obj;
    
    if (stack.includes(obj))
        return null;

    let s = stack.concat([obj]);

    return Array.isArray(obj)
        ? obj.map(x => decycle(x, s))
        : Object.fromEntries(
            Object.entries(obj)
                .map(([k, v]) => [k, decycle(v, s)]));
}


app.get('/getUsers', function(req, res) {
    
    let names = {};
    
    connectionsPopcorn.forEach(connection => {
        //names.push(connectionsName[connection]);
        names[connectionsName[connection]] = connectionsTimes[connection];

    });

    console.log(names)

    //res.json(decycle(names));
    res.json(names);
});