const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const amqp = require('amqplib');

const receiveUsername = require('./receiveUsername.js');

const mongoUrl = process.env.atlasURL;
const amqpString = process.env.amqpString;

const dbName = 'positionsDatabase';
const collectionName = "positionsCollection";
const options = {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
    socketTimeoutMS: 3000,
    useUnifiedTopology: true,
};

var username;
var latitude;
var longitude;
var match = false;

async function findUser()
{
    username = await receiveUsername();
}


async function startQuery() {
    var client;
    
    console.time('Connect time ');
    try {
        client = await MongoClient.connect(mongoUrl, options);
    }
    catch (error) {
        console.log(`Error:\n${error.message}`);
        process.exit();
    }
    finally {
        console.timeEnd('Connect time ');
    }

    const collection = client.db(dbName).collection(collectionName);
    console.time('Find time: ');
    try {
        const results = await collection.find({ Username: username }).toArray();
        if (results.length !== 0) {
            results.forEach(result => {
                latitude = result.Latitude;
                longitude = result.Longitude;
                match = true;
                console.log(`Локацията на ${username} e : lat: ${latitude} long: ${longitude} `);
            });
        } else {

            console.log(`Няма такъв username!`);
        }
        client.close();
    }
    catch (error) {
        console.log(error.message);
    }
    finally {
        console.timeEnd('Find time: ');
    }
}

async function send() {
	var connection = await amqp.connect(amqpString, 'heartbeat=60');
    var channel = await connection.createChannel();

    var queue = 'location';
    var message = `${username}, ${latitude}, ${longitude}` ;
    await channel.assertQueue(queue, {
        durable: false
    });
    await channel.sendToQueue(queue, Buffer.from(message));
    console.log(`Sent: "${message}"`);
	setTimeout( () => {
		channel.close();
		connection.close();
	}, 250);
};


(async () => {
    await findUser();
    await startQuery();
    if(match) send();
})();