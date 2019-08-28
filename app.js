const express = require('express');
const port = process.env.PORT || 3000;
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { createMessage, createLocationMessage } = require('./utils/utils');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const _BASE_MAP_URL = 'https://google.com/maps?q=';

//!Cheatsheet
//socket.emit => send to client
//io.emit => send to all users
//socket.broadcast.emit => send to all users except user that sent
//io.to.emit => emit to all in specific room
//socket.broadcast.to.emit => to all in room except me

//Serve static css, js and images
const public = path.join(__dirname, './public');
app.use(express.static(public));

//Sockets server
//!socket - obj contains info about connection
io.on('connection', socket => {
	socket.on('joinRoom', ({ username, room }) => {
		socket.join(room);

		socket.emit('onMessage', createMessage('Welcome to the Chat'));

		socket.broadcast
			.to(room)
			.emit('onMessage', createMessage(`${username} has joined chat`));
	});

	//!get message
	socket.on('onMessageSend', (msg, cbAcknowledge) => {
		const filter = new Filter();

		if (filter.isProfane(msg)) {
			return cbAcknowledge('Profanity is now allowed!');
		}

		//!send message to everyone
		io.to('Cars').emit('onMessage', createMessage(msg));
		//Callback to client if message was delivered for ex.
		cbAcknowledge();
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
