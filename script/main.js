'use strict';

// let img = new Image();
// img.src = '/kenney_tiny-dungeon/Tilemap/tilemap_packed.png';
// img.onload = function() {
// 	init();
// };

const EMPTY = 0;
const WALL = 1;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const map = addRooms(new Array(270).fill().map(() => new Array(480).fill().map(() => WALL)));

function init() {
	for (let [i, row] of map.entries()) {
		for (let [j, column] of row.entries()) {
			ctx.fillStyle = column === WALL ? 'brown' : 'black';
			ctx.fillRect(j * 4, i * 4, 4, 4);
		}
	}
}

function gaussianRandom(mean = 0, stdev = 1) {
	const u = 1 - Math.random(); // Converting [0,1) to (0,1]
	const v = Math.random();
	const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

	// Transform to the desired mean and standard deviation:
	return z * stdev + mean;
}

function addRooms(dungeon) {
	const rooms = [];
	const height = dungeon.length;
	const width = dungeon[0].length;
	const radius = 100;
	const centerX = Math.floor(width / 2) - (radius / 4);
	const centerY = Math.floor(height / 2) - (radius / 4);

	for (let i = 0; i < 150; i++) rooms.push(generateRandomRectangle(centerX, centerY, radius))
	
	for (let room of rooms) {
		for (let y = room.y; y < room.y + room.height; y++) {
			for (let x = room.x; x < room.x + room.width; x++) {
				try {
					dungeon[y][x] = EMPTY;
				} catch {
					debugger
				}
			}
		}
	}

	return dungeon;
}

function generateRandomRectangle(centerX, centerY, maxRadius) {
	const width = Math.floor(Math.abs(gaussianRandom()) * 10);
	const height = Math.floor(Math.abs(gaussianRandom()) * 10);
	const ratio = width / height;

	if (ratio > 2 || ratio < 0.5) {
		return generateRandomRectangle(centerX, centerY, maxRadius);
	}

	const angle = Math.random() * Math.PI * 2;
	const radius = Math.random() * maxRadius;

	const x = Math.floor(centerX + radius * Math.cos(angle));
	const y = Math.floor(centerY + radius * Math.sin(angle));

	return { x, y, width, height };
}

function randomPointInCircle(radius, centerX, centerY) {
	const angle = Math.random() * 2 * Math.PI;
	const r = radius * Math.sqrt(Math.random());
	const x = centerX + r * Math.cos(angle);
	const y = centerY + r * Math.sin(angle);
	return { x: Math.floor(x), y: Math.floor(y) };
}
init();
