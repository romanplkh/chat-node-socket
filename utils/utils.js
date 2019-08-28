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

const renderHTML = (value, options) => {
	let attributes;
	if (options.attr) {
		attributes = options.attr.reduce((acc, cur) => {
			const [kvp] = Object.entries(cur);
			const [att, val] = kvp;
			acc += `${att}="${val}" `;
			return acc;
		}, '');
	}

	let htmlElement = `<${options.tag} ${attributes} class="${options.class}">${value}</${options.tag}>`;

	return htmlElement;
};

const parseURI = uri => {
	let kvp = uri.replace(/[\?]/g, '').split('&');

	return kvp.reduce((acc, cur) => {
		const [key, value] = cur.replace(/\+/g, ' ').split('=');

		acc[key] = value;
		return acc;
	}, {});
};

module.exports = {
	createMessage,
	createLocationMessage,
	parseURI,
	renderHTML
};
