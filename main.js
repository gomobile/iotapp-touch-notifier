//Create node.js Server with homepage (Works)
/*var http = require('http');
var app = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Welcome to the Galileo Node.js Server \n');
}).listen(1337);
console.log('Node.js Server running');
*/

//Create node.js with homepage (Works)
/*var app = require('express')();
var http = require('http').Server(app);

app.get('/', function(req, res){
  res.send('<h1>Hello world from Intel Galileo</h1>');
});

http.listen(1337, function(){
  console.log('listening on *:1337');
});*/

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.send('<h1>Hello world from Intel Galileo</h1>');
});

//Attach a 'connection' event handler to the server
io.on('connection', function(socket){
    console.log('a user connected');
    //Emits an event along with a message
    socket.emit('connected', 'Welcome');
    
    //Start watching Sensors connected to Galileo board
    startSensorWatch(socket);
    
    //Attach a 'disconnect' event handler to the socket
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

http.listen(1337, function(){
  console.log('listening on *:1337');
});

//MRAA Library was installed on the board directly through ssh session
var mraa = require("mraa");

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//GROVE Kit Shield D6 --> GPIO6
//GROVE Kit Shield D2 --> GPIO2
function startSensorWatch(socket){
    var touch_sensor_value = 0;
    var last_t_sensor_value;
    //Touch Sensor connected to D2 pin
    var digital_pin_D2 = new mraa.Gpio(2);
    digital_pin_D2.dir(mraa.DIR_IN);
    
    //Buzzer connected to D6
    var digital_pin_D6 = new mraa.Gpio(6);
    digital_pin_D6.dir(mraa.DIR_OUT);

    console.log("Sample Reading Touch Sensor");

    digital_pin_D6.write(0);

    setInterval(function(){
        touch_sensor_value = digital_pin_D2.read()
        if (touch_sensor_value == 1 && last_t_sensor_value == 0){
            //console.log("Buzz ON!!!");
            socket.emit('message', "present");
            digital_pin_D6.write(touch_sensor_value);
        }
        else if (touch_sensor_value == 0 && last_t_sensor_value == 1){
            //console.log("Buzz OFF!!!");
            //socket.emit('message', "absent");
            digital_pin_D6.write(touch_sensor_value);
        }
        last_t_sensor_value = touch_sensor_value;
    },500);
}