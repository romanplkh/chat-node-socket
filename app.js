const express = require('express');
const port = process.env.PORT || 3000;
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { createMessage, createLocationMessage } = require('./utils/helpers');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const _BASE_MAP_URL = 'https://google.com/maps?q=';

//Serve static css, js and images
const public = path.join(__dirname, './public');
app.use(express.static(public));

//Sockets server
//!socket - obj contains info about connection
io.on('connection', socket => {
	socket.emit('onMessage', createMessage('Welcome to the Chat'));

	//Broadcast except this current connection
	socket.broadcast.emit('onMessage', createMessage('A new user joined chat'));

	//!get message
	socket.on('onMessageSend', (msg, cbAcknowledge) => {
		const filter = new Filter();

		if (filter.isProfane(msg)) {
			return cbAcknowledge('Profanity is now allowed!');
		}

		// const timeStamp = `${new Date()
		// 	.toLocaleDateString()
		// 	.replace(
		// 		/[\/]/g,
		// 		'-'
		// 	)} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date()
		// 	.getSeconds()
		// 	.toPrecision(2)}`;

		//!send message to everyone, because of io.
		io.emit('onMessage', createMessage(msg));
		//Callback to client if message was delivered for ex.
		cbAcknowledge(`This if from server. Delivered ${timeStamp}`);
	});

	//catch data from event
	socket.on('onGeoCoords', ({ latitude, longitude }, cb) => {
		io.emit(
			'onLocationMsg',
			createLocationMessage(`${_BASE_MAP_URL}${latitude},${longitude} `)
		);
		cb('Geoposition shared');
	});

	//built-in event
	socket.on('disconnect', () => {
		socket.broadcast.emit('onMessage', createMessage('User has left the chat'));
	});
});

server.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
