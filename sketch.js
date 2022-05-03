const [ gridSizeX, gridSizeY ] = [ 10, 10 ];
const tileSize = 40;
const initialTiles = 50;
const debug = false
let grid = [];
let tiles = [];
let tries = [];
let tileID = 1

let xGrid, yGrid;
let colors = {}
let reversed = false
let velocity = 0.2

function setup () {
	createCanvas(1000, 1000);

	xGrid = (width - tileSize * gridSizeX) / 2;
	yGrid = (height - tileSize * gridSizeY) / 2;

	colors.tile = color(220)
	colors.clickedTile = color(200, 50, 50)
	colors.lineColor = color(20)

	startGame()

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

	// drawGuideLines();
	tiles.map((t) => {
		t.update();
		t.draw();
	});
	// drawGridCompletion()

	// noLoop();
}

function mouseClicked () {
	// verify is is clicked inside a tile
	for (let i in tiles) {
		t = tiles[ i ]
		if (t.isInside(mouseX - xGrid, mouseY - yGrid)) {
			debugConsole(t)
			// t.color = colors.clickedTile
			console.log(t)

			if (t.move()) {
				t.removeFromGrid()
				tiles.splice(i, 1)
			}

			break
		}
	}

	if (tiles.length == 0) startGame()
}

// ===================== Game functions

function startGame () {
	grid = [];
	tiles = [];
	tries = [];
	tileID = 1

	generateGrid();
	completeTiles();
}

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
	if (!reversed) {
		typeOftiles.reverse()
		reversed = true
	}

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

		this.color = colors.tile
		this.animating = false
	}

	calculatePoints () {
		let x = this.x * tileSize
		let y = this.y * tileSize

		this.points = []

		this.originalPoints.map((p) => {
			this.points.push(createVector(x + p[ 0 ], y + p[ 1 ]));
		});

		this.center = createVector(
			// (this.points[ 1 ].x + this.points[ 7 ].x) / 2,
			// (this.points[ 1 ].y + this.points[ 7 ].y) / 2
			(this.points[ 0 ].x + this.points[ 2 ].x) / 2,
			(this.points[ 0 ].y + this.points[ 2 ].y) / 2
		);
	}

	draw () {
		fill(this.color)

		rect(this.points[ 0 ].x, this.points[ 0 ].y, tileLongEndWithPadding(this.sizeX), tileLongEndWithPadding(this.sizeY), 5)

		// beginShape();

		// this.points.map((p) => {
		// 	vertex(p.x, p.y);
		// });

		// endShape(CLOSE);

		this.drawArrow()
	}

	update () {
		if (this.animating) {
			if (this.xDirection < 0) { // left
				if (this.x > this.xDestiny) {
					this.x -= velocity
				} else {
					this.animating = false
					this.x = this.xDestiny
				}
			} else if (this.xDirection > 0) { // right
				if (this.x < this.xDestiny) {
					this.x += velocity
				} else {
					this.animating = false
					this.x = this.xDestiny
				}
			} else if (this.yDirection < 0) { // up
				if (this.y > this.yDestiny) {
					this.y -= velocity
				} else {
					this.animating = false
					this.y = this.yDestiny
				}
			} else if (this.yDirection > 0) { // bottom
				if (this.y < this.yDestiny) {
					this.y += velocity
				} else {
					this.animating = false
					this.y = this.yDestiny
				}
			}

			if (!this.animating) {
				this.placeNewPositionOnGrid()
			}

			this.calculatePoints()
		}
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
		this.calculateArea()

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
		// Verify if has any equals lines and rows
		if (tile.xDirection != 0) {
			for (let i = 0; i < tile.sizeY; i++) {
				if (this.verticals.includes(tile.y + i)) return true
			}
		} else if (tile.yDirection != 0) {
			for (let i = 0; i < tile.sizeX; i++) {
				if (this.horizontals.includes(tile.x + i)) return true
			}
		}

		return false
	}

	// return true if exits from the grid
	move () {
		// up = 0 or down = 2
		if (this.yDirection != 0) {
			return this.moveUpDown()
		} else if (this.xDirection != 0) {
			return this.moveLeftRight()
		}

		return false
	}

	moveUpDown () {
		let condition = (direction, first, second) => {
			if (direction < 0) return first >= second
			else if (direction > 0) return first <= second
		}

		let direction = this.direction == 0 ? 'up' : 'down'
		let actualY = this.y
		let border = 0 // up
		if (this.yDirection > 0) {
			// down
			actualY += this.sizeY - 1
			border = gridSizeY - 1
		}

		// If is on up border
		if ((this.yDirection < 0 && this.y == 0) || (this.yDirection > 0 && actualY == border)) {
			debugConsole('exited by the border')
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
		} else {
			// Abranger o tamanho do tile caso seja para uma direção positiva
			if (this.yDirection == 1) {
				actualY -= (this.sizeY - 1)
			}

			if (this.y != actualY) {
				debugConsole('dont exited, but translated')

				// Se o limite não foi a borda do grid
				this.translate(this.x, actualY)
			}
		}
	}

	moveLeftRight () {
		let condition = (direction, first, second) => {
			if (direction > 0) return first <= second
			else if (direction < 0) return first >= second
		}

		let direction = this.direction == 1 ? 'right' : 'left'
		let actualX = this.x
		let border = 0 // left
		if (this.xDirection > 0) {
			// right
			actualX += this.sizeX - 1
			border = gridSizeX - 1
		}

		// If is on up border
		if ((this.xDirection < 0 && this.x == 0) || (this.xDirection > 0 && actualX == border)) {
			return true
		} else {
			debugConsole('search direction', direction, 'start from collumn', actualX)
			// validate if the tiles up or down are free
			// collumn by collumn
			for (let i = actualX + this.xDirection; condition(this.xDirection, i, border); i += this.xDirection) {
				debugConsole('verify collumn', i)
				let allFree = true
				for (let y of this.verticals) {
					debugConsole(i, y)
					if (grid[ i ][ y ]) {
						debugConsole('the collumn', i, 'on line', y, 'isnt free')
						allFree = false
						break
					}
				}

				if (allFree) {
					debugConsole('collumn', i, 'is all free')
					actualX = i
				} else {
					debugConsole('collumn', i, "isn't all free")
					break
				}

			}

			debugConsole('the most clean collumn is', actualX)
		}

		if (actualX == border) {
			// Se saiu do grid
			return true
		} else {
			// Abranger o tamanho do tile caso seja para uma direção positiva
			if (this.xDirection == 1) {
				actualX -= (this.sizeX - 1)
			}

			if (this.x != actualX) {
				debugConsole('dont exited, but translated')

				// Se o limite não foi a borda do grid
				this.translate(actualX, this.y)
			}
		}
	}

	translate (newX, newY) {
		this.removeFromGrid()

		this.animating = true
		this.xDestiny = newX
		this.yDestiny = newY
	}

	// Called when exit the grid
	removeFromGrid () {
		for (let x = 0; x < this.sizeX; x++) {
			for (let y = 0; y < this.sizeY; y++) {
				grid[ this.x + x ][ this.y + y ] = false
				debugConsole('removed x', this.x + x, this.y + y)
			}
		}
	}

	placeNewPositionOnGrid () {
		grid[ this.x ][ this.y ] = true;
		for (let i = 0; i < this.sizeX; i++) {
			for (let j = 0; j < this.sizeY; j++) {
				if (this.x + i < gridSizeX && this.y + j < gridSizeY) grid[ this.x + i ][ this.y + j ] = true;
			}
		}
	}

	calculateArea () {
		this.verticals = []
		this.horizontals = []

		// Lines and rows from this tile
		for (let i = 0; i < this.sizeY; i++) {
			this.verticals.push(this.y + i)
		}
		for (let i = 0; i < this.sizeX; i++) {
			this.horizontals.push(this.x + i)
		}
	}
}

// ======================
const tilePadding = 2;
const tileEndWithPadding = tileSize - tilePadding;
const tileLongEndWithPadding = (size) => tileSize * size - tilePadding * 2;

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
