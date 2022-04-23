const [ gridSizeX, gridSizeY ] = [ 20, 20 ];
const tileSize = 40;
const initialTiles = 80;
const debug = true
let grid = [];

let tiles = [];
let tries = [];

let xGrid, yGrid;

let tileID = 1

let colors = {}

function setup () {
	createCanvas(1000, 1000);

	xGrid = (width - tileSize * gridSizeX) / 2;
	yGrid = (height - tileSize * gridSizeY) / 2;

	colors.tile = color(220)
	colors.clickedTile = color(200, 50, 50)
	colors.lineColor = color(20)

	generateGrid();

	completeTiles();

	// noStroke();
	stroke(colors.lineColor)
	// strokeCap(ROUND)
	// strokeWeight(4)

	textAlign(CENTER, CENTER)
	textSize(15)
}

function draw () {
	background(100);

	translate(xGrid, yGrid);

	drawGuideLines();
	tiles.map((t) => {
		t.draw();
	});
	drawGridCompletion()

	// noLoop();
}

function mouseClicked () {
	// verify is is clicked inside a tile
	for (let i in tiles) {
		t = tiles[ i ]
		if (t.isInside(mouseX - xGrid, mouseY - yGrid)) {
			debugConsole(t)
			t.color = colors.clickedTile

			if (t.move()) {
				t.cleanGrid()
				tiles.splice(i, 1)
			}

			break
		}
	}
}

// ===================== Game functions

function generateGrid () {
	for (let i = 0; i < gridSizeX; i++) {
		grid[ i ] = [];
		for (let j = 0; j < gridSizeY; j++) {
			grid[ i ][ j ] = false;
		}
	}

	while (tiles.length < initialTiles) {
		newPos = generateTile();
	}
}

function generateTile (tempType, tempX, tempY) {
	let type, x, y;

	if (tempType) {
		type = typeOftiles[ tempType ];
		x = tempX;
		y = tempY;
	} else {
		type = typeOftiles[ Math.floor(Math.random() * typeOftiles.length) ];
		x = Math.floor(random(gridSizeX));
		y = Math.floor(random(gridSizeY));
	}

	let posX = x * tileSize;
	let posY = y * tileSize;

	let reference = `${type.name}-${posX}-${posY}`;

	if (!tries.includes(reference)) {
		tries.push(reference);
	} else {
		return;
	}

	let tile = new Tile(type, posX, posY, x, y);

	let valid = isValidTile(tile, posX, posY);

	if (valid) {
		tiles.push(tile);

		// Complete grid coordenates
		grid[ x ][ y ] = true;
		for (let i = 0; i < type.sizeX; i++) {
			for (let j = 0; j < type.sizeY; j++) {
				if (x + i < gridSizeX && y + j < gridSizeY) grid[ x + i ][ y + j ] = true;
			}
		}
		// if (!tempType) {
		// }

		return { x, y, type };
	}
}

function completeTiles () {
	typeOftiles.reverse()
	for (let i = 0; i < gridSizeY; i++) {
		for (let j = 0; j < gridSizeX; j++) {
			value = grid[ j ][ i ];

			if (!value) {
				// iterate tile's types
				let newPos;
				for (let k in typeOftiles) {
					newPos = generateTile(k, j, i);
					if (newPos) {
						break
					}
				}
			}
		}
	}
}

function isValidTile (tile, x, y) {
	let valid = true;

	// validate if the points is out of bounds
	for (let p of tile.points) {
		let inside = false;

		if (p.x > tileSize * gridSizeX || p.y > tileSize * gridSizeY) {
			valid = false;
			break;
		}
	}

	// validate if a tile is inside another
	for (let t of tiles) {
		for (let p of tile.points) {
			inside = t.isInside(p.x, p.y);
			if (inside) break;

			inside = t.isInside(tile.center.x, tile.center.y);
			if (inside) break;
		}

		if (inside) {
			valid = false;
			break;
		}
	}

	if (this.invalid) {
		valid = false
	}

	return valid;
}

function drawGuideLines () {
	push();
	stroke(colors.lineColor);
	for (let i = 0; i <= gridSizeX; i++) {
		line(i * tileSize, 0, i * tileSize, tileSize * gridSizeY);
		text(i != gridSizeX ? i : 'X', i * tileSize + tileSize / 2, yGrid - tileSize * 3)
	}

	for (let i = 0; i <= gridSizeY; i++) {
		line(0, i * tileSize, tileSize * gridSizeX, i * tileSize);
		text(i != gridSizeX ? i : 'Y', xGrid - tileSize * 3, i * tileSize + tileSize / 2)
	}
	pop();
}

function drawGridCompletion () {
	push()
	stroke(255, 0, 0)
	strokeWeight(5)
	for (let i in grid) {
		for (let j in grid[ i ]) {
			if (grid[ i ][ j ]) {
				point(i * tileSize + tileSize / 2, j * tileSize + tileSize / 2)
			}
		}
	}
	pop()
}

function roundCorners (points) {
	const variation = 6
	let newPoints = []

	// TOP LEFT
	let x = points[ 0 ][ 0 ]
	let y = points[ 0 ][ 1 ]
	newPoints.push([ x + variation, y ])
	newPoints.push([ x + variation / 2, y + variation / 2 ])
	newPoints.push([ x, y + variation ])

	// BOTTOM LEFT
	x = points[ 1 ][ 0 ]
	y = points[ 1 ][ 1 ]
	newPoints.push([ x, y - variation ])
	newPoints.push([ x + variation / 2, y - variation / 2 ])
	newPoints.push([ x + variation, y ])

	// BOOTM RIGHT
	x = points[ 2 ][ 0 ]
	y = points[ 2 ][ 1 ]
	newPoints.push([ x - variation, y ])
	newPoints.push([ x - variation / 2, y - variation / 2 ])
	newPoints.push([ x, y - variation ])

	// TOP RIGHT
	x = points[ 3 ][ 0 ]
	y = points[ 3 ][ 1 ]
	newPoints.push([ x, y + variation ])
	newPoints.push([ x - variation / 2, y + variation / 2 ])
	newPoints.push([ x - variation, y ])

	// return newPoints
	return points
}

function debugConsole (...params) {
	if (debug) console.log(...params)
}

function condition (direction, first, second) {
	if (direction < 0) return first >= second
	else if (direction > 0) return first <= second
}

// ===================== CLASSES

class Tile {
	constructor({ name, points, sizeX, sizeY }, x, y, gridX, gridY) {
		this.id = tileID++

		this.originalPoints = points;
		this.x = gridX
		this.y = gridY
		this.invalid = false

		this.sizeX = sizeX
		this.sizeY = sizeY

		this.calculatePoints()

		this.direction = this.generateDirection()

		this.center = createVector(
			// (this.points[ 1 ].x + this.points[ 7 ].x) / 2,
			// (this.points[ 1 ].y + this.points[ 7 ].y) / 2
			(this.points[ 0 ].x + this.points[ 2 ].x) / 2,
			(this.points[ 0 ].y + this.points[ 2 ].y) / 2
		);

		this.color = colors.tile
	}

	calculatePoints () {
		let x = this.x * tileSize
		let y = this.y * tileSize

		this.points = []

		this.originalPoints.map((p) => {
			this.points.push(createVector(x + p[ 0 ], y + p[ 1 ]));
		});
	}

	draw () {
		fill(this.color)
		// noFill()
		beginShape();

		this.points.map((p) => {
			vertex(p.x, p.y);
		});

		endShape(CLOSE);

		this.drawArrow()
		// push()
		// text(`${this.id}`, this.points[0].x - 10, this.points[0].y + 10)
		// pop()
	}

	drawArrow () {
		const arrowSize = 5
		const arrowLateral = 5

		switch (this.direction) {
			case 0: // UP
				line(this.center.x, this.center.y + arrowSize, this.center.x, this.center.y - arrowSize)
				line(this.center.x - arrowLateral, this.center.y, this.center.x, this.center.y - arrowSize)
				line(this.center.x + arrowLateral, this.center.y, this.center.x, this.center.y - arrowSize)
				break
			case 1:  // RIGHT
				line(this.center.x - arrowSize, this.center.y, this.center.x + arrowSize, this.center.y)
				line(this.center.x, this.center.y - arrowLateral, this.center.x + arrowSize, this.center.y)
				line(this.center.x, this.center.y + arrowLateral, this.center.x + arrowSize, this.center.y)
				break
			case 2:  // DOWN
				line(this.center.x, this.center.y + arrowSize, this.center.x, this.center.y - arrowSize)
				line(this.center.x - arrowLateral, this.center.y, this.center.x, this.center.y + arrowSize)
				line(this.center.x + arrowLateral, this.center.y, this.center.x, this.center.y + arrowSize)
				break
			case 3:  // LEFT
				line(this.center.x - arrowSize, this.center.y, this.center.x + arrowSize, this.center.y)
				line(this.center.x, this.center.y - arrowLateral, this.center.x - arrowSize, this.center.y)
				line(this.center.x, this.center.y + arrowLateral, this.center.x - arrowSize, this.center.y)
				break
		}
	}

	isInside (x, y) {
		if (
			x >= this.points[ 0 ].x &&
			y >= this.points[ 0 ].y &&
			x <= this.points[ 2 ].x &&
			y <= this.points[ 2 ].y
		) {
			return true;
		}

		return false;
	}

	generateDirection () {
		let direction, oposite = true
		this.stack = 100

		while (oposite) {
			direction = Math.floor(random(4)); // 0 = up, 1 = right, 2 = down, 3 = left
			// oposite = false
			// continue

			let x = 0, y = 0

			switch (direction) {
				case 0:
					y--
					break
				case 1:
					x++
					break
				case 2:
					y++
					break
				case 3:
					x--
					break
			}

			this.xDirection = x
			this.yDirection = y

			if (tiles.length == 0) break

			// Validate if exist any tile in oposite direction
			for (let t of tiles) {
				let parallel = this.isParallel(t)

				if (parallel) {

					if (x != 0 && t.xDirection != 0) {
						if (t.xDirection == x * -1) {
							oposite = true
							break
						}
					} else if (y != 0 && t.yDirection != 0) {
						if (t.yDirection == y * -1) {
							oposite = true
							break
						}
					} else {
						oposite = false
					}
				} else {
					oposite = false
				}

				if (oposite) break
			}

			if (!oposite) break

			this.stack--
			if (this.stack <= 0) {
				// debugConsole('stack limit')
				this.invalid = true
				break
			}
		}

		return direction
	}

	isParallel (tile) {
		let verticals = []
		let horizontals = []

		if (this.verticals) {
			verticals = this.verticals
			horizontals = this.horizontals
		} else {
			verticals = []
			horizontals = []

			// Lines and rows from this tile
			for (let i = 0; i < this.sizeY; i++) {
				verticals.push(this.y + i)
			}
			for (let i = 0; i < this.sizeX; i++) {
				horizontals.push(this.x + i)
			}

			this.verticals = verticals
			this.horizontals = horizontals
		}

		// Verify if has any equals lines and rows
		if (tile.xDirection != 0) {
			for (let i = 0; i < tile.sizeY; i++) {
				if (verticals.includes(tile.y + i)) return true
			}
		} else if (tile.yDirection != 0) {
			for (let i = 0; i < tile.sizeX; i++) {
				if (horizontals.includes(tile.x + i)) return true
			}
		}

		return false
	}

	// return true if exits from the grid
	move () {
		// up = 0 or down = 2
		if (this.yDirection != 0) {
			return this.moveUpDown()
		}

		return false
	}

	moveUpDown () {
		let direction = this.direction == 0 ? 'up' : 'down'
		let actualY = this.y
		let border = 0 // up
		if (this.yDirection > 0) {
			// down
			actualY += this.sizeY - 1
			border = gridSizeY - 1
		}

		// If is on up border
		if (this.y == 0 || actualY == gridSizeY - 1) {
			return true
		} else {
			debugConsole('search direction', direction, 'start from line', actualY)
			// validate if the tiles up or doww are free
			// line by line
			for (let i = actualY + this.yDirection; condition(this.yDirection, i, border); i += this.yDirection) {
				debugConsole('verify line', i)
				let allFree = true
				for (let x of this.horizontals) {
					if (grid[ x ][ i ]) {
						debugConsole('the line', i, 'on col', x, 'isnt free')
						allFree = false
						break
					}
				}

				if (allFree) {
					debugConsole('line', i, 'is all free')
					actualY = i
				} else {
					debugConsole('line', i, "isn't all free")
					break
				}

			}

			debugConsole('the most clean line is', actualY)
		}

		if (actualY == border) {
			// Se saiu do grid
			return true
		} else if (this.y != actualY) {
			// Se o limite não foi a borda do grid
			this.translate(this.x, actualY)
		}
	}

	translate (newX, newY) {
		this.x = newX
		this.y = newY
	}

	cleanGrid () {
		for (let x = 0; x < this.sizeX; x++) {
			for (let y = 0; y < this.sizeY; y++) {
				grid[ this.x + x ][ this.y + y ] = false
			}
		}
	}
}

// ======================
const tilePadding = 4;
const tileEndWithPadding = tileSize - tilePadding;
const tileLongEndWithPadding = (size) => tileSize * size - tilePadding;

const typeOftiles = [
	{
		name: "normal",
		points: roundCorners([
			[ tilePadding, tilePadding ],
			[ tilePadding, tileEndWithPadding ],
			[ tileEndWithPadding, tileEndWithPadding ],
			[ tileEndWithPadding, tilePadding ],
		]),
		sizeX: 1,
		sizeY: 1,
	},
	{
		name: "vertical",
		points: roundCorners([
			[ tilePadding, tilePadding ],
			[ tilePadding, tileLongEndWithPadding(2) ],
			[ tileEndWithPadding, tileLongEndWithPadding(2) ],
			[ tileEndWithPadding, tilePadding ],
		]),
		sizeX: 1,
		sizeY: 2,
	},
	{
		name: "horizontal",
		points: roundCorners([
			[ tilePadding, tilePadding ],
			[ tilePadding, tileEndWithPadding ],
			[ tileLongEndWithPadding(2), tileEndWithPadding ],
			[ tileLongEndWithPadding(2), tilePadding ],
		]),
		sizeX: 2,
		sizeY: 1,
	},
	{
		name: "big",
		points: roundCorners([
			[ tilePadding, tilePadding ],
			[ tilePadding, tileLongEndWithPadding(2) ],
			[ tileLongEndWithPadding(2), tileLongEndWithPadding(2) ],
			[ tileLongEndWithPadding(2), tilePadding ],
		]),
		sizeX: 2,
		sizeY: 2,
	},
	{
		name: "big-vertical",
		points: roundCorners([
			[ tilePadding, tilePadding ],
			[ tilePadding, tileLongEndWithPadding(3) ],
			[ tileEndWithPadding, tileLongEndWithPadding(3) ],
			[ tileEndWithPadding, tilePadding ],
		]),
		sizeX: 1,
		sizeY: 3,
	},
	{
		name: "big-horizontal",
		points: roundCorners([
			[ tilePadding, tilePadding ],
			[ tilePadding, tileEndWithPadding ],
			[ tileLongEndWithPadding(3), tileEndWithPadding ],
			[ tileLongEndWithPadding(3), tilePadding ],
		]),
		sizeX: 3,
		sizeY: 1,
	},
];
