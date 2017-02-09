/*
 * This sample IoT app illustrates how to read digital data using the touch
 * sensor in a Grover Starter Kit Plus – IoT Intel® Edition. Also, this
 * application will start a simple web server on the IoT board that can be
 * used to communicate over wi-fi with the board, using a WebSocket
 * connection.
 *
 * Supported Intel IoT development boards are identified in the code.
 *
 * See LICENSE.md for license terms and conditions.
 *
 * https://software.intel.com/en-us/xdk/docs/using-templates-nodejs-iot
 */

/* spec jslint and jshint lines for desired JavaScript linting */
/* see http://www.jslint.com/help.html and http://jshint.com/docs */
/* jslint node:true */
/* jshint unused:true */

"use strict" ;


var mraa = require("mraa");

//GROVE Kit Shield D6 --> GPIO6
//GROVE Kit Shield D2 --> GPIO2
function startSensorWatch(socket) {

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

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('<h1>Hello world from Intel IoT platform!</h1>');
}).listen(1337);
var io = require('socket.io')(app);

console.log("Sample Reading Touch Sensor");

//Attach a 'connection' event handler to the server
io.on('connection', function (socket) {

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
