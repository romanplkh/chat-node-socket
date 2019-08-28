//sockets client init
const socket = io();

const form = document.querySelector('#msgform');
const inputMSG = form.querySelector("input[name='message']");
const msgBtn = form.querySelector("input[type='submit']");
const geoBtn = document.querySelector('#btnLocation');
const messagesWindow = document.querySelector('#messages');

//CUSTOM RENDER
Object.defineProperty(Element.prototype, 'renderHTML', {
	value: function renderHTML(value, options) {
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

		this.insertAdjacentHTML('beforeend', htmlElement);
	},
	writable: true,
	configurable: true
});

//

//catch event from server
socket.on('onMessage', msg => {
	messagesWindow.renderHTML(msg, { tag: 'p' });
});

socket.on('onLocationMsg', msg => {
	messagesWindow.renderHTML('My current location', {
		tag: 'a',
		class: 'link',
		attr: [{ href: msg }, { target: '_blank' }]
	});
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
