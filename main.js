/*
 * Intel® XDK IoT Touch Notifier Node.js* App
 *
 * This sample IoT app illustrates how to read digital data using the touch sensor
 * in a Grover Starter Kit Plus – IoT Intel® Edition. Also, this application will
 * start a simple web server on the IoT board that can be used to communicate
 * wirelessly with the board, using a WebSocket connection.
 *
 * This sample has only been tested on a Galileo and Edison board. It may run on
 * other IoT Node.js platforms, but may require changes to the I/O initialization
 * and configuration code.
 *
 * https://software.intel.com/en-us/xdk/docs/lp-xdk-iot
 */


// keep these lines (below) for proper jshinting and jslinting
/*jslint node:true, vars:true, bitwise:true */
/*jshint unused:true, undef:true */
// see http://www.jslint.com/help.html and http://jshint.com/docs


var mraa = require("mraa");

//GROVE Kit Shield D6 --> GPIO6
//GROVE Kit Shield D2 --> GPIO2
function startSensorWatch(socket) {
    'use strict';
    var touch_sensor_value = 0, last_t_sensor_value;

    //Touch Sensor connected to D2 connector
    var digital_pin_D2 = new mraa.Gpio(2);
    digital_pin_D2.dir(mraa.DIR_IN);

    //Buzzer connected to D6 connector
    var digital_pin_D6 = new mraa.Gpio(6);
    digital_pin_D6.dir(mraa.DIR_OUT);

    digital_pin_D6.write(0);

    setInterval(function () {
        touch_sensor_value = digital_pin_D2.read();
        if (touch_sensor_value === 1 && last_t_sensor_value === 0) {
            console.log("Buzz ON!!!");
            socket.emit('message', "present");
            digital_pin_D6.write(touch_sensor_value);
        } else if (touch_sensor_value === 0 && last_t_sensor_value === 1) {
            console.log("Buzz OFF!!!");
            //socket.emit('message', "absent");
            digital_pin_D6.write(touch_sensor_value);
        }
        last_t_sensor_value = touch_sensor_value;
    }, 500);
}


//Create Socket.io server
var http = require('http');
var app = http.createServer(function (req, res) {
    'use strict';
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('<h1>Hello world from Intel IoT platform!</h1>');
}).listen(1337);
var io = require('socket.io')(app);

console.log("Sample Reading Touch Sensor");

//Attach a 'connection' event handler to the server
io.on('connection', function (socket) {
    'use strict';
    console.log('a user connected');
    //Emits an event along with a message
    socket.emit('connected', 'Welcome');

    //Start watching Sensors connected to Galileo board
    startSensorWatch(socket);

    //Attach a 'disconnect' event handler to the socket
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
});
