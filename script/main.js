'use strict';

// let img = new Image();
// img.src = '/kenney_tiny-dungeon/Tilemap/tilemap_packed.png';
// img.onload = function() {
// 	init();
// };

const FLOOR = 0;
const WALL = 1;
const DOOR = 2;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

const collides = (a, b) => !(((a.y + a.height) < (b.y)) || (a.y > (b.y + b.height)) || ((a.x + a.width) < b.x) || (a.x > (b.x + b.width)));
const generateSize = () => Math.max(
	Math.floor(gaussianRandom() * 15),
	Math.floor(gaussianRandom() * 15),
	Math.floor(gaussianRandom() * 15),
	Math.floor(gaussianRandom() * 15),
	5
)

const map = new Array(270).fill().map(() => new Array(480).fill().map(() => WALL));
const rooms = addRooms(map);
carveDoorways(map, rooms, kruskalMST(createRoomGraph(rooms)));

function init() {
	for (let [i, row] of map.entries()) {
		for (let [j, column] of row.entries()) {
			ctx.fillStyle = column === FLOOR ? 'black' : 'brown';
			ctx.fillRect(j * 2, i * 2, 2, 2);
		}
	}
}

function addRooms(dungeon, attempts = 150) {
	const rooms = [];
	for (let i = 0; i < attempts; i++) {
		const room = generateRoom(dungeon[0].length, dungeon.length);
		console.log(room)
		if (!room) continue;
		if (rooms.find(oldRoom => collides(room, oldRoom))) continue;
		console.log('Room added')
		rooms.push(room);
	}


	for (const room of rooms) {
		for (let y = room.y; y < room.y + room.height; y++) {
			for (let x = room.x; x < room.x + room.width; x++) {
				dungeon[y][x] = FLOOR;
			}
		}
	}

	return rooms;
}

function generateRoom(dungeonWidth, dungeonHeight, attempts = 5) {
	const width = generateSize();
	const height = generateSize();
	const ratio = Math.min(width, height) / Math.max(width, height);

	if ((ratio < .5 || ratio > 2)) {
		if (attempts) return generateRoom(dungeonWidth, dungeonHeight, --attempts);
		else return;
	}

	const x = Math.floor(Math.random() * (dungeonWidth - width - 2)) + 1;
	const y = Math.floor(Math.random() * (dungeonHeight - height - 2)) + 1;
	return {width, height, x, y, id: Math.random()}
}

function carveDoorways(map, rooms, tree) {
	for (let edge of tree.edges) {
		let room1 = rooms[edge.node1];
		let room2 = rooms[edge.node2];

		let midpoint = {
			x: (room1.x + room1.width / 2 + room2.x + room2.width / 2) / 2,
			y: (room1.y + room1.height / 2 + room2.y + room2.height / 2) / 2
		};

		let dx = room2.x + room2.width / 2 - midpoint.x;
		let dy = room2.y + room2.height / 2 - midpoint.y;
		let dist = Math.sqrt(dx * dx + dy * dy);
		dx /= dist;
		dy /= dist;

		let x = Math.round(midpoint.x);
		let y = Math.round(midpoint.y);
		let opened = false;
		while (map[y] && map[y][x]) {
			if (map[y][x] === WALL) {
				map[y][x] = DOOR;
				opened = true;
				break;
			} else if (map[y][x] !== DOOR) {
				break;
			}
			x += Math.round(dx);
			y += Math.round(dy);
		}

		if (!opened) {
			x = Math.round(midpoint.x);
			y = Math.round(midpoint.y);
			while (map[y] && map[y][x]) {
				if (map[y][x] === WALL) {
					map[y][x] = DOOR;
					break;
				} else if (map[y][x] !== DOOR) {
					break;
				}
				x -= Math.round(dx);
				y -= Math.round(dy);
			}
		}
	}
}


function gaussianRandom() {
	let u = 0, v = 0;
	while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
	while (v === 0) v = Math.random();
	return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function createRoomGraph(rooms) {
	const graph = {};

	rooms.forEach((room) => {
		graph[room.id] = room;
	});

	return graph;
}

function kruskalMST(graph) {
	const V = graph.length;
	const parent = new Array(V);
	const rank = new Array(V).fill(0);

	function find(i) {
		while (parent[i] !== i) {
			i = parent[i];
		}
		return i;
	}

	function union(i, j) {
		const iRoot = find(i);
		const jRoot = find(j);
		if (iRoot === jRoot) {
			return;
		}
		if (rank[iRoot] < rank[jRoot]) {
			parent[iRoot] = jRoot;
		} else if (rank[jRoot] < rank[iRoot]) {
			parent[jRoot] = iRoot;
		} else {
			parent[iRoot] = jRoot;
			rank[jRoot]++;
		}
	}

	const edges = [];
	for (let i = 0; i < V; i++) {
		for (let j = i + 1; j < V; j++) {
			if (graph[i][j] !== 0) {
				edges.push([i, j, graph[i][j]]);
			}
		}
	}
	edges.sort((a, b) => a[2] - b[2]);

	for (let i = 0; i < V; i++) {
		parent[i] = i;
		rank[i] = 0;
	}

	const MST = Array.from(Array(V), () => Array(V).fill(0));

	for (let i = 0; i < edges.length; i++) {
		const [u, v, w] = edges[i];
		const setU = find(u);
		const setV = find(v);
		if (setU !== setV) {
			MST[u][v] = w;
			MST[v][u] = w;
			union(setU, setV);
		}
	}

	MST.edges = edges;

	return MST;
}

init();
