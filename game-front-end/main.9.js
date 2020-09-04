const clearButton = document.querySelector('.clear');
const saveButton = document.querySelector('.save');
const eraserButton = document.querySelector('.eraser');
const penButton = document.querySelector('.pen');
const successMsgEl = document.querySelector('.success-msg');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const playerNicknameEl = document.querySelector('.nick-name');
const gameIdEl = document.querySelector('.game-id');

let currentGame = null;
let currentGameImages = [];

const startGameBtn = document.querySelector('.start-game-btn');
const joinGameBtn = document.querySelector('.join-game-btn');

startGameBtn.addEventListener('click', startGame);
joinGameBtn.addEventListener('click', joinGame);

let isDrawing = false;
let pointerColor = 'black';
let lineThickness = 3;

const backEndURL = 'http://192.168.1.74:80/project/game-back-end/test.php';

canvas.addEventListener('mousedown', start);
canvas.addEventListener('touchstart', start);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchmove', drawTouch);
canvas.addEventListener('mouseup', stop);
canvas.addEventListener('mouseout', stop);

penButton.addEventListener('click', (e) => {
	switchColor('black', 3);
});
eraserButton.addEventListener('click', (e) => {
	switchColor('white', 16);
});

clearButton.addEventListener('click', clearCanvas);
// saveButton.addEventListener('click', DownloadCanvasAsImage);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function start(e) {
	isDrawing = true;
	draw(e);
}
function draw({ offsetX: x, offsetY: y }) {
	if (!isDrawing) return;
	ctx.lineWidth = lineThickness;
	ctx.lineCap = 'round';
	ctx.strokeStyle = pointerColor;

	ctx.lineTo(x, y);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(x, y);
}
function drawTouch(e) {
	if (!isDrawing) return;

	// const { pageX: x, pageY: y } = e;
	// document.body.innerText += `${e.constructor.name}`

	const { pageX, pageY, screenY } = e.touches[0];

	console.log(e);

	let leftSide = e.target.getBoundingClientRect().left;
	let topSide = canvas.offsetParent.offsetTop + canvas.offsetTop;

	ctx.lineWidth = lineThickness;
	ctx.lineCap = 'round';
	ctx.strokeStyle = pointerColor;

	// document.querySelector('.test-bitches').textContent =  topSide;

	ctx.lineTo(pageX - leftSide, pageY - topSide);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(pageX - leftSide, pageY - topSide);
}
function stop(event) {
	isDrawing = false;
	ctx.beginPath();
	if (event.type !== 'mouseout') {
		predict().then((data) => {
			console.log(data);
		});
	}
}
function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	whitenCanvas();
	switchColor('black', 3);
}
function resizeCanvas() {
	canvas.width = '350';
	canvas.height = '350';
	clearCanvas();
}
function whitenCanvas() {
	ctx.fillStyle = 'white';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

async function postData(url = '', data) {
	// Default options are marked with *
	const response = await fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		mode: 'cors', // no-cors, *cors, same-origin
		cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
		redirect: 'follow', // manual, *follow, error
		body: data, // body data type must match "Content-Type" header
	});
	return response.json(); // parses JSON response into native JavaScript objects
}

const projectDictionary = {
	sun: 'خورشید',
	glasses: 'عینک',
	house: 'خانه',
	car: 'ماشین',
	pan: 'ماهیتابه',
	hand: 'دست',
	chair: 'صندلی',
	banana: 'موز',
	egg: 'تخم مرغ',
	stickman: 'آدمک',
	flower: 'گل',
	eye: 'چشم',
	foot: 'پا',
	tree: 'درخت',
};

function selectKey(value) {
	return Object.keys(projectDictionary).find(
		(key) => projectDictionary[key] === value
	);
}

function successMsg() {
	successMsgEl.classList.remove('d-none');
	successMsgEl.classList.add('d-flex');
	setTimeout(() => {
		successMsgEl.classList.add('d-none');
		successMsgEl.classList.remove('d-flex');
	}, 1000);
}
function DownloadCanvasAsImage() {
	const selectedValue = selectKey(document.querySelector('select').value);
	let filename = `${selectedValue}-${Math.floor(Math.random() * 2000000)}`;
	// let downloadLink = document.createElement('a');
	// downloadLink.setAttribute('download', 'CanvasAsImage.png');
	canvas.toBlob((blob) => {
		var formData = new FormData();
		formData.append('myimg', blob, `${filename}.png`);

		postData('https://seemystories.ir/project/serve.php', formData).then(
			(data) => {
				console.log(data); // JSON data parsed by `data.json()` call
				successMsg();
			}
		);

		clearCanvas();
	});
}

function switchColor(color, thickness) {
	lineThickness = thickness;
	pointerColor = color;
}

function randomIdGenerator(length) {
	let result = '';
	let characters =
		'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(
			Math.floor(Math.random() * charactersLength)
		);
	}
	return result;
}

function startGame(e) {
	e.preventDefault();
	e.stopPropagation();

	if (
		window.localStorage.getItem('nickName') &&
		window.localStorage.getItem('userId') &&
		playerNicknameEl.value == window.localStorage.getItem('nickName')
	) {
		playerNicknameEl.value = window.localStorage.getItem('nickName');
	} else {
		window.localStorage.setItem('nickName', playerNicknameEl.value);
		window.localStorage.setItem('userId', randomIdGenerator(8));
	}

	let resp = postData(
		`${backEndURL}?start`,
		JSON.stringify({
			userId: window.localStorage.getItem('userId'),
			startTime: new Date().getTime(),
			gameId: gameIdEl.value,
			nickName: window.localStorage.getItem('nickName'),
		})
	);
	resp.then((data) => {
		initiateGameParams(data);
		addTimer(currentGame.startTimeStamp);
	});

	return false;
}

function joinGame(e) {
	e.preventDefault();
	e.stopPropagation();

	if (
		window.localStorage.getItem('nickName') &&
		window.localStorage.getItem('userId') &&
		playerNicknameEl.value == window.localStorage.getItem('nickName')
	) {
		playerNicknameEl.value = window.localStorage.getItem('nickName');
	} else {
		window.localStorage.setItem('nickName', playerNicknameEl.value);
		window.localStorage.setItem('userId', randomIdGenerator(8));
	}

	let resp = postData(
		`${backEndURL}?addplayer`,
		JSON.stringify({
			userId: window.localStorage.getItem('userId'),
			gameId: gameIdEl.value,
			nickName: window.localStorage.getItem('nickName'),
		})
	);
	resp.then((data) => {
		initiateGameParams(data);
		addTimer(currentGame.startTimeStamp);
	});
}

function submitScore(params) {
	let resp = postData(
		`${backEndURL}?submitscore`,
		JSON.stringify({
			userId: window.localStorage.getItem('userId'),
			time: new Date().getTime(),
			gameId: gameIdEl.value,
		})
	);
	resp.then((data) => {
		// currentGame = data;
		// addTimer(currentGame.startTimeStamp());
	});
}


function isFinished() {

	let resp = postData(
		`${backEndURL}?isfinished`,
		JSON.stringify({
			gameId: gameIdEl.value,
		})
	);
	resp.then((data) => {
		if (data.isFinished) {
			showScores(data.players, currentGame.startTimeStamp);
			clearInterval(finishGameInterval);
		} else {
			waitForEnd();
		}
	});

	
}

function showScores(players, startTime) {
	let tableRow = '';
	players.sort((playerA, playerB) => playerA.time - playerB.time);
	players.forEach((player, index) => {
		if (player.name == window.localStorage.getItem('nickName')) {
			tableRow += `<tr style="color: gold;background-color: #1b7e46;"><th>${
				index + 1
			}</th><th>${player.name}</th><td>${
				player.id
			}</td><td style="direction: ltr; text-align: center;">${
				player.time - startTime
			} ms</td></tr>`;
			return;
		}
		tableRow += `<tr><th>${index + 1}</th><th>${player.name}</th><td>
			${player.id}</td><td style="direction: ltr; text-align: center;">${
			player.time - startTime
		} ms</td></tr>`;
	});
	console.log(tableRow);
	const table = document.querySelector('table>tbody');
	table.innerHTML += tableRow;
}

function initiateGameParams(data) {
	currentGame = data;
	currentGameImages = data.imageOrders;
	nextLevel();
}

function waitForEnd(params) {
	coverCanvas();
}

function addTimer(gameStart) {
	const timerDiv = document.querySelector('.timer');
	timerDiv.style.color = 'rgb(220, 220, 220)';
	let redValue = 116;
	let myInterval = setInterval(
		(function timer() {
			const secondsToGame = parseInt(
				Math.abs((gameStart - parseInt(new Date().getTime())) / 999)
			);
			timerDiv.innerHTML = `<span class="timer-span">${secondsToGame}</span> ثانیه تا شروع بازی`;
			timerDiv.style.backgroundColor = `rgb(${redValue + 5}, 42, 42)`;

			if (secondsToGame <= 0) {
				freeCanvas();
				timerDiv.innerHTML = '';
				clearInterval(myInterval);
			}
			return timer;
		})(),
		1000
	);
}

function freeCanvas() {
	document.querySelector('.canvas-msg').classList.add('d-none');
	coverForm();
}

async function checkPrediction(currentItem) {
	const prediction = await predict();
	if (prediction.item == currentItem && prediction.probability > 0.92) {
		return true;
	}
	return false;
}

function coverForm(params) {
	document.querySelector('.form-msg').classList.remove('d-none');
}

function coverCanvas(msg) {
	const canvasMsgEl = document.querySelector('.canvas-msg');
	canvasMsgEl.textContent =
		'صبر کنید تا بقیه ی بازیکنان هم بازی را تمام کنند';
	canvasMsgEl.classList.remove('d-none');
}

window.addEventListener('load', (e) => {
	if (
		window.localStorage.getItem('nickName') &&
		window.localStorage.getItem('userId')
	) {
		playerNicknameEl.value = window.localStorage.getItem('nickName');
	}
});

const nextImgBtn = document.querySelector('.next-item-btn');
nextImgBtn.addEventListener('click', () => {
	checkPrediction(currentGameImages[level]).then((isTrue) => {
		if (isTrue) {
			nextLevel();
			return;
		}
		alert('به اندازه ی کافی شبیه نیست دوباره سعی کن');
	});
});

const currentItemEl = document.querySelector('.current-item-to-draw > span');
// let currentItem = '';
let level = -1;

let finishGameInterval = null;
function nextLevel() {
	level++;
	if (level < currentGameImages.length) {
		currentItemEl.textContent =
			projectDictionary[`${currentGameImages[level]}`];
	} else {
		submitScore();
		finishGameInterval = setInterval(
			() => {
				isFinished();
			},
			1500
		);
	}
}