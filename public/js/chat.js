//sockets client init
const socket = io();

const form = document.querySelector('#msgform');
const inputMSG = form.querySelector("input[name='message']");
const msgBtn = form.querySelector("input[type='submit']");
const geoBtn = document.querySelector('#btnLocation');
const messagesWindow = document.querySelector('#messages');

//CUSTOM RENDER
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

//

//catch event from server
socket.on('onMessage', data => {
	const { text, createdAt } = data;
	messagesWindow.insertAdjacentHTML(
		'beforeend',
		renderHTML(createdAt + ' - ' + text, { tag: 'p' })
	);
});

socket.on('onLocationMsg', msg => {
	messagesWindow.insertAdjacentHTML(
		'beforeend',
		`<span>${msg.createdAt}<span> -` +
			renderHTML('My current location', {
				tag: 'a',
				class: 'link',
				attr: [{ href: msg.url }, { target: '_blank' }]
			})
	);
});

form.addEventListener('submit', e => {
	e.preventDefault();

	//disable btn
	msgBtn.setAttribute('disabled', true);

	const msg = inputMSG.value;
	//emit event
	// 3rd arg is a callback allows to acknowledge this event by server
	socket.emit('onMessageSend', msg, responseFromServer => {
		//enable btn
		msgBtn.removeAttribute('disabled');
		inputMSG.value = '';
		inputMSG.focus();

		if (responseFromServer) {
			console.log(responseFromServer);
		}
		console.log('Message was delivered');
	});
});

geoBtn.addEventListener('click', () => {
	geoBtn.setAttribute('disabled', true);
	navigator.geolocation.getCurrentPosition(
		position => {
			socket.emit(
				'onGeoCoords',
				{
					latitude: position.coords.latitude,
					longitude: position.coords.longitude
				},
				msg => {
					console.log(msg);
				}
			);

			geoBtn.removeAttribute('disabled');
		},
		error => {
			alert(error.message);
			geoBtn.removeAttribute('disabled');
		}
	);
});
