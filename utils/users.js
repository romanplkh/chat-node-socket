const users = [];

const toLower = val => {
	return val.trim().toLowerCase();
};

const addUser = ({ id, username, room }) => {
	//Prepare data
	username = toLower(username);
	room = toLower(room);

	//Validate  strings
	if (!username || !room) {
		return {
			error: 'Username and room are required!'
		};
	}

	//Check for existing users
	const exists = users.find(
		user => user.room == room && user.username == username
	);

	if (exists) {
		return {
			error: 'This username is already taken'
		};
	}

	//Add to users
	const user = { id, username, room };
	users.push(user);

	return { user };
};

const removeUser = id => {
	const indexUser = users.findIndex(user => user.id === id);
	if (indexUser > -1) {
		return users.splice(indexUser, 1)[0];
	}
};

const getUser = id => {
	return users.find(user => user.id === id);
};

const getUsersInRoom = room => {
	return users.filter(user => user.room === toLower(room));
};

module.exports = {
	addUser,
	removeUser,
	getUser,
	getUsersInRoom
};
