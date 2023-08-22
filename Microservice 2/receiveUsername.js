const amqp = require('amqplib');
const fs = require('fs');
require('dotenv').config();

const amqpString = process.env.amqpString;
var username;
async function receiveUsername() {
        var connection = await amqp.connect(amqpString, 'heartbeat=60');
        var channel = await connection.createChannel();
    
        var queue = 'username';
        await channel.assertQueue(queue, {
            durable: false
        });
        console.log(`Waiting for messages in ${queue} queue...`);
        await channel.consume(queue, (data) => {
            var message = data.content.toString();
            username = message;
    
            console.log(`Message received: ${username}`);
        }, {
            noAck: true
        });

    return username;
}
module.exports = receiveUsername;