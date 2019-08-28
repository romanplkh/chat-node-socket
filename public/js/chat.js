const h = new Helpers();
const { renderHTML, parseURI } = h;
//sockets client init
const socket = io();

const form = document.querySelector('#msgform');
const inputMSG = form.querySelector("input[name='message']");
const msgBtn = form.querySelector("input[type='submit']");
const geoBtn = document.querySelector('#btnLocation');
const messagesWindow = document.querySelector('#messages');

//SCROLL

const autoScroll = () => {
	//GETT MESSAGE
	const newMessage = messagesWindow.lastElementChild;

	//Height of new message
	const newMessageStyles = getComputedStyle(newMessage);
	const newMessageMarginBottom = parseInt(newMessageStyles.marginBottom);
	const newMessageHeight = newMessage.offsetHeight + newMessageMarginBottom;

	//Visible height
	const visibleHeight = messagesWindow.offsetHeight;

	//Height of messages container
	const containerHeight = messagesWindow.scrollHeight;

	//How far have I scrolled?
	const scrollOffset = messagesWindow.scrollTop + visibleHeight;

	if (containerHeight - newMessageHeight <= scrollOffset) {
		messagesWindow.scrollTop = messagesWindow.scrollHeight;
	}
};

//OPTIONS
const { username, room } = parseURI(location.search);

//JOIN ROOM
socket.emit('joinRoom', { username, room }, serverResponse => {
	if (serverResponse) {
		alert(serverResponse);
		location.href = '/';
	}
});

socket.on('onMessage', data => {
	const { text, createdAt } = data;
	messagesWindow.insertAdjacentHTML(
		'beforeend',
		renderHTML(createdAt + ' - ' + text, { tag: 'p' })
	);
	autoScroll();
});

socket.on('onLocationMsg', msg => {
	messagesWindow.insertAdjacentHTML(
		'beforeend',
		`<span class="text-danger">${msg.username}</span> ` +
			renderHTML('My current location', {
				tag: 'a',
				class: 'link',
				attr: [{ href: msg.url }, { target: '_blank' }]
			}) +
			` <p >${msg.createdAt}<p>`
	);
	autoScroll();
});

//SIDEBAR
socket.on('onChangeUserInRoom', ({ room, users }) => {
	console.log(room);
	console.log(users);
});

form.addEventListener('submit', e => {
	e.preventDefault();

	//disable btn
	msgBtn.setAttribute('disabled', true);

	const msg = inputMSG.value;

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
