const clearButton = document.querySelector('.clear');
const saveButton = document.querySelector('.save');
const successMsgEl = document.querySelector('.success-msg');
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

let isDrawing = false;

canvas.addEventListener('mousedown', start);
canvas.addEventListener('touchstart', start);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('touchmove', drawTouch);
canvas.addEventListener('mouseup', stop);
// canvas.addEventListener('touchend', stop);
canvas.addEventListener('mouseout', stop);

clearButton.addEventListener('click', clearCanvas);
saveButton.addEventListener('click', DownloadCanvasAsImage);

window.addEventListener('resize', resizeCanvas);

resizeCanvas();

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

function start(e) {
	isDrawing = true;
	draw(e);
}

function draw({ offsetX: x, offsetY: y }) {
	if (!isDrawing) return;
	ctx.lineWidth = 3;
	ctx.lineCap = 'round';
	ctx.strokeStyle = 'black';

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

	ctx.lineWidth = 3;
	ctx.lineCap = 'round';
	ctx.strokeStyle = 'black';

	ctx.lineTo(pageX - canvas.offsetLeft, pageY - canvas.offsetTop);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(pageX - canvas.offsetLeft, pageY - canvas.offsetTop);
}

function stop() {
	isDrawing = false;
	ctx.beginPath();
}

function clearCanvas() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	whitenCanvas();
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
