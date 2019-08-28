const express = require('express');
const port = process.env.PORT || 3000;
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { createMessage, createLocationMessage } = require('./utils/utils');
const {
	getUser,
	addUser,
	removeUser,
	getUsersInRoom
} = require('./utils/users');

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
	socket.on('joinRoom', (credentials, cbAcknowledge) => {
		const { error, user } = addUser({ id: socket.id, ...credentials });

		if (error) {
			return cbAcknowledge(error);
		}

		socket.join(user.room);
		socket.emit('onMessage', createMessage('Admin', 'Welcome to the Chat'));

		socket.broadcast
			.to(user.room)
			.emit(
				'onMessage',
				createMessage('Admin', `${user.username} has joined chat`)
			);

		//SEND ALL USERS IN ROOM
		io.to(user.room).emit('onChangeUserInRoom', {
			room: user.room,
			users: getUsersInRoom(user.room)
		});
		cbAcknowledge();
	});

	//!get message
	socket.on('onMessageSend', (msg, cbAcknowledge) => {
		const user = getUser(socket.id);

		const filter = new Filter();

		if (filter.isProfane(msg)) {
			return cbAcknowledge('Profanity is now allowed!');
		}

		//!send message to everyone
		io.to(user.room).emit('onMessage', createMessage(user.username, msg));
		//Callback to client if message was delivered for ex.
		cbAcknowledge();
	});

	//catch data from event
	socket.on('onGeoCoords', ({ latitude, longitude }, cb) => {
		const user = getUser(socket.id);
		io.to(user.room).emit(
			'onLocationMsg',
			createLocationMessage(
				user.username,
				`${_BASE_MAP_URL}${latitude},${longitude} `
			)
		);
		cb('Geoposition shared');
	});

	//built-in event
	socket.on('disconnect', () => {
		const user = removeUser(socket.id);

		if (user) {
			socket
				.to(user.room)
				.emit(
					'onMessage',
					createMessage('Admin', `${user.username} has left the chat`)
				);

			io.to(user.room).emit('onChangeUserInRoom', {
				room: user.room,
				users: getUsersInRoom(user.room)
			});
		}
	});
});

server.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
