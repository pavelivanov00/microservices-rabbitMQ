const readline = require('readline');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();
const amqp = require('amqplib');

const mongoUrl = process.env.atlasURL;
const amqpString = process.env.amqpString;

const dbName = 'accounts';
const collectionName = "accountsCollection";
const options = {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
    socketTimeoutMS: 3000,
    useUnifiedTopology: true,
};

var name;
var password;
var username;
var match = false;

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
        const results = await collection.find({ Name: name, Password: password }).toArray();
        if (results.length !== 0) {
            results.forEach(result => {
                username = result.Username;
                console.log(`Намерен е човек с username: ${username}`);
                match = true;
            });
        } else {
            console.log(`Сгрешено име или парола!`);
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

async function askName() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question('What is your name? ', name => {
            rl.close();
            resolve(name);
        });
    });
}

async function askPassword() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    return new Promise((resolve) => {
        rl.question('What is your password? ', password => {
            rl.close();
            resolve(password);
        });
    });
}

async function send() {
	var connection = await amqp.connect(amqpString, 'heartbeat=60');
    var channel = await connection.createChannel();

    var queue = 'username';
    var message = username;
    await channel.assertQueue(queue, {
        durable: false
    });
    await channel.sendToQueue(queue, Buffer.from(message));
    console.log(`The message is sent: ${message}`);
	setTimeout( () => {
		channel.close();
		connection.close();
	}, 250);
};

(async () => {
    name = await askName();
    password = await askPassword();
    await startQuery();
    if(match) send();
})();