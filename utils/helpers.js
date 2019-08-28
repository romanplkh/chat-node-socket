const moment = require('moment');

const createMessage = text => {
	return {
		text,
		createdAt: moment(new Date().getTime()).format('MMM D, hh:mmA')
	};
};

const createLocationMessage = url => {
	return {
		url,
		createdAt: moment(new Date().getTime()).format('MMM D, hh:mmA')
	};
};

module.exports = {
	createMessage,
	createLocationMessage
};
