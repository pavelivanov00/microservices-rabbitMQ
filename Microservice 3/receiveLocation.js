var amqp = require('amqplib');
const fs = require('fs');
require('dotenv').config();

const amqpString = process.env.amqpString;

(async () => {
    var connection = await amqp.connect(amqpString, 'heartbeat=60');
    var channel = await connection.createChannel();

    var queue = 'location';
    await channel.assertQueue(queue, {
        durable: false
    });
    console.log(`Waiting for messages in ${queue} queue...`);
    await channel.consume(queue, (data) => {
        var message = data.content.toString();
        var messageArray = message.split(',');
        var username = messageArray[0];
        var latitude = messageArray[1];
        var longitude = messageArray[2];

        console.log(`Message received: ${username} ${latitude} ${longitude}`);
        fs.appendFile('coordinates.js', `var username = "${username}";
var latitude = ${latitude}; 
var longitude = ${longitude};
document.getElementById("username").innerHTML = username;
document.getElementById("latitude").innerHTML = latitude;
document.getElementById("longitude").innerHTML = longitude;`, (err) => {
            if (err) throw err;
            console.log('Coordinates written to file');
        });
    }, {
        noAck: true
    });
})();