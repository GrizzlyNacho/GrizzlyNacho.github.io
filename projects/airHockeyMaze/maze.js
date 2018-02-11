
class Tile {
	constructor() {
		this.up = true;
		this.down = true;
		this.left = true;
		this.right = true;
	}
}

// MazeGame
class MazeGame {
	constructor(canvas) {

		this.rinkWidth = 525;
		this.rinkHeight = 675;
		this.border = 50;
		this.cellSize = 75;
		this.cellsAcross = this.rinkWidth / this.cellSize;
		this.cellsDown = this.rinkHeight / this.cellSize;
		canvas.width = this.rinkWidth + 2 * this.border;
		canvas.height = this.rinkHeight + 2 * this.border;

		this.canvas = canvas;
		this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
		this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
		this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
		this.canvas.addEventListener('mouseout', this.onMouseOut.bind(this));

		this.isAnimating = false;
		this.gameOver = false;
		this.pulseCount = 0;

		this.maxMag = 200; // Max magnitude of player vect
		this.paddleAnimDir = null;
		this.paddleAnimLength = 0;
		this.startMousePos = null;
		this.curMousePos = null;

		this.cardinals = [
			new Coord(-1,0),
			new Coord(0,-1),
			new Coord(1,0),
			new Coord(0,1)
		];
		this.cardinalNames = ["left","up","right","down"];

		this.tiles = [];
		this.playerPos = new Coord(this.rinkWidth/2 + this.border, 
				this.border + this.rinkHeight - this.cellSize / 2);
		this.playerRadius = this.cellSize / 5;

		this.walls = [];
		this.seed = 1;
		this.generateMaze();

		var me = this;
		function drawLoop() {
			me.drawCanvas();
			window.requestAnimationFrame(drawLoop);
		}
		drawLoop();

		this.debug = false;
		this.debugCollisions = [];
	}

	// Lookup the name of the direction by the direction
	getCardinalName(coord) {
		for(let idxDir = 0; idxDir < this.cardinals.length; idxDir++) {
			if (coord.equals(this.cardinals[idxDir])) {
				return this.cardinalNames[idxDir];
			}
		}
	}

	// test if a tile coord is in the game bounds
	inBounds(tileCoord) {
		return tileCoord.x >= 0 && tileCoord.x < this.cellsAcross 
				&& tileCoord.y >= 0 && tileCoord.y < this.cellsDown;
	}

	// Fetch the array index assuming this 2d coordinate is in a 1d array
	arrPos(tileCoord) {
		return tileCoord.x + (tileCoord.y * this.cellsAcross);
	}

	// Fetch the tile at the coord
	tileAt(coord) {
		if (!this.inBounds(coord)) {
			return null;
		}
		return this.tiles[this.arrPos(coord)];
	}

	random() {
		if (this.debug) {
			var temp = Math.sin(this.seed++) * 10000;
			return temp - Math.floor(temp);	
		}
		return Math.random();
	}

	// Add wall for cell index coordinates given
	addWall(x1, y1, x2, y2) {
		let newWallEndA = new Coord(this.border + x1 * this.cellSize,
				this.border + y1 * this.cellSize);
		let newWallEndB = new Coord(this.border + x2 * this.cellSize,
				this.border + y2 * this.cellSize)


		// scan existing walls for one that overlaps in point and has the sathis vect.
		let vect = newWallEndB.subtract(newWallEndA);
		for (let idxWall = 0; idxWall < this.walls.length; idxWall++) {
			let curWall = this.walls[idxWall];
			let curWallVect = curWall[1].subtract(curWall[0]);

			if (vect.equals(curWallVect)) {
				if (newWallEndA.equals(curWall[1])) {
					let replaceWall = [
						curWall[0],
						newWallEndB
					];
					this.walls.splice(idxWall, 1);
					this.walls.push(replaceWall);
					return;
				} else if (newWallEndB.equals(curWall[0])) {
					let replaceWall = [
						newWallEndA,
						curWall[1]
					];
					this.walls.splice(idxWall, 1);
					this.walls.push(replaceWall);
					return;
				}
			}
		}

		this.walls.push([ newWallEndA, newWallEndB ]);
	}

	/**
 	 * Maze generation based on simple algorithm here: 
 	 * https://github.com/dstromberg2/maze-generator/blob/master/mazegenerator.js
 	 */
	generateMaze() {
		let explored = [];
		for (let idxCell = 0; idxCell < this.cellsAcross * this.cellsDown; idxCell++) {
			this.tiles.push(new Tile());
			explored.push(false);
		}

		// Always start from middle of bottom row.
		let cur = new Coord(~~((this.cellsAcross -1)/2), this.cellsDown - 1);;
		let path = [cur];
		explored[this.arrPos(cur)] = true;
		let exploreCount = 1;

		while (exploreCount < this.cellsAcross * this.cellsDown) {
			let arrCardinals = [];

			for( let idxDir = 0; idxDir < this.cardinals.length; idxDir++) {
				let testCoord = cur.add(this.cardinals[idxDir]);
				if (this.inBounds(testCoord) && !explored[this.arrPos(testCoord)]) {
					arrCardinals.push(idxDir);
				}
			}

			if (arrCardinals.length) {
				let randDir = arrCardinals[~~(this.random()*arrCardinals.length)];
				let dir = this.cardinals[randDir];
				let oppositeDir = dir.multiply(-1);
				let neighbour = cur.add(dir);

				// Disable the walls
				this.tileAt(cur)[this.getCardinalName(dir)] = false;
				this.tileAt(neighbour)[this.getCardinalName(oppositeDir)] = false;

				explored[this.arrPos(neighbour)] = true;
				exploreCount++;
				cur = neighbour;
				path.push(cur);

			} else {
				cur = path.pop();
			}
		}

		this.walls = [];
		for (let row = 0; row < this.cellsDown; row++) {
			for (let col = 0; col < this.cellsAcross; col++) {
				// populate right walls
				let curTile = this.tileAt(new Coord(col, row));
				if (col != (this.cellsAcross - 1)
					&& curTile.right === true) {
					this.addWall(col + 1, row, col + 1, row + 1);
				}

				// Populate Bottom Walls.
				if (row != (this.cellsDown - 1)
					&& curTile.down === true) {
					this.addWall(col, row + 1, col + 1, row + 1);
				}
			}
		}
		
		// populate external walls
		this.addWall(0, 0, 0, this.cellsDown);
		this.addWall(this.cellsAcross, 0, this.cellsAcross, this.cellsDown);
		this.addWall(0, this.cellsDown, this.cellsAcross, this.cellsDown);

		// Top has two pieces to leave goal open.
		let goalX = ~~((this.cellsAcross -1)/2);
		this.addWall(0, 0, goalX, 0);
		this.addWall(goalX + 1, 0, this.cellsAcross, 0);

		//this.addWall(3,6,3,7);
	}

	drawRinkCircle(ctx, x, y, alpha) {
		ctx.lineWidth = 4;
		ctx.strokeStyle = "rgba(255, 0, 0, "+alpha+")";
		ctx.beginPath();
		ctx.arc(x, y, this.rinkWidth / 8, 0, 2 * Math.PI);
		ctx.stroke();

		ctx.beginPath();
		ctx.fillStyle = "rgba(255, 0, 0, "+alpha+")";	
		ctx.arc(x, y, this.rinkWidth / 32, 0, 2 * Math.PI);
		ctx.fill();
		
	}

	drawRink(ctx) {
		let alpha = "0.15";

		ctx.translate(this.border, this.border);

		ctx.fillStyle = "#EEEEEE";
		ctx.fillRect(0, 0, this.rinkWidth, this.rinkHeight);

		// Red line through the middle
		ctx.lineWidth = 6;
		ctx.strokeStyle = "rgba(255, 0, 0, "+alpha+")";
		ctx.beginPath();
		ctx.moveTo(0, this.rinkHeight / 2);
		ctx.lineTo(this.rinkWidth, this.rinkHeight / 2);
		ctx.stroke();

		// blue lines at thirds
		ctx.lineWidth = 8;
		ctx.strokeStyle = "rgba(0, 0, 255, "+alpha+")";
		ctx.beginPath();
		ctx.moveTo(0, this.rinkHeight / 3);
		ctx.lineTo(this.rinkWidth, this.rinkHeight / 3);
		ctx.moveTo(0, (this.rinkHeight / 3) * 2);
		ctx.lineTo(this.rinkWidth, (this.rinkHeight / 3) * 2);
		ctx.stroke();

		// red circles in four corners
		ctx.lineWidth = 4;
		ctx.strokeStyle = "rgba(255, 0, 0, "+alpha+")";
		this.drawRinkCircle(ctx, this.rinkWidth / 4, 
			this.rinkHeight / 6, alpha);
		this.drawRinkCircle(ctx, this.rinkWidth - (this.rinkWidth / 4), 
			this.rinkHeight / 6, alpha);
		this.drawRinkCircle(ctx, this.rinkWidth / 4, 
			this.rinkHeight - (this.rinkHeight / 6), alpha);
		this.drawRinkCircle(ctx, this.rinkWidth - (this.rinkWidth / 4), 
			this.rinkHeight - (this.rinkHeight / 6), alpha);

		ctx.translate(-this.border, -this.border);
	}

	drawWalls(ctx) {
		for (let idxWall = 0; idxWall < this.walls.length; idxWall++) {
			let wall = this.walls[idxWall];

			ctx.lineWidth = 3;
			ctx.strokeStyle = "black";
			ctx.beginPath();
			ctx.moveTo(wall[0].x, wall[0].y);
			ctx.lineTo(wall[1].x, wall[1].y);
			ctx.stroke();
		}
	}

	drawDebug(ctx) {
		if (!this.debug) { return; }

		if (this.debugCollisions && this.debugCollisions.length > 0) {
			for (let idxCol = 0; idxCol < this.debugCollisions.length; idxCol++) {
				let collision = this.debugCollisions[idxCol];

				ctx.lineWidth = 3;
				ctx.strokeStyle = (collision.type == "wall") ? "red" : "orange";
				ctx.beginPath();
				ctx.arc(collision.point.x, collision.point.y, 3, 0, 2 * Math.PI);
				ctx.moveTo(collision.point.x, collision.point.y);
				ctx.lineTo(collision.point.x + collision.reflect.x*15, collision.point.y + collision.reflect.y*15);
				ctx.stroke();

				ctx.beginPath();
				ctx.strokeStyle = "green";
				ctx.arc(collision.wallContact.x, collision.wallContact.y, 3, 0, 2 * Math.PI);
				ctx.stroke();
			}	
		}
	}

	drawHoles(ctx) {
		let holeSpace = 12.5;
		ctx.translate(this.border, this.border);
		for(let x = holeSpace; x < this.rinkWidth; x += holeSpace) {
			for (let y = holeSpace; y < this.rinkHeight; y+= holeSpace) {
				ctx.beginPath();
				ctx.fillStyle = "grey";
				ctx.arc(x, y, 1, 0, 2 * Math.PI);
				ctx.fill();
			}
		}
		ctx.translate(-this.border, -this.border);
	}

	drawPlayer(ctx) {
		let inside = "#2C59D6";
		let outside = "#2832C1";
		ctx.translate(this.playerPos.x, this.playerPos.y);

			ctx.lineWidth = 1;
			
			ctx.beginPath();
			ctx.arc(0, 0, this.playerRadius, 0, 2 * Math.PI);
			ctx.fillStyle = outside; 
			ctx.strokeStyle = "rgba(50, 50, 50, 0.7)";
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(0, 0, this.playerRadius - this.playerRadius/5, 0, 2 * Math.PI);
			ctx.fillStyle = inside; 
			ctx.strokeStyle = "rgba(50, 50, 50, 0.5)";
			ctx.fill();
			ctx.stroke();
			
		ctx.translate(-this.playerPos.x, -this.playerPos.y);
	}

	drawPaddle(ctx, paddleCenter) {
		let inside = "#2C59D6";
		let outside = "#2832C1";

		ctx.translate(paddleCenter.x, paddleCenter.y);

			ctx.lineWidth = 1;
			
			ctx.beginPath();
			ctx.arc(0, 0, this.playerRadius * 2, 0, 2 * Math.PI);
			ctx.fillStyle = outside; 
			ctx.strokeStyle = "rgba(50, 50, 50, 0.7)";
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(0, 0, this.playerRadius * 1.5, 0, 2 * Math.PI);
			ctx.fillStyle = "#112251"; 
			ctx.strokeStyle = "rgba(50, 50, 50, 0.7)";
			ctx.fill();
			ctx.stroke();

			ctx.beginPath();
			ctx.arc(0, 0, this.playerRadius - this.playerRadius/5, 0, 2 * Math.PI);
			ctx.fillStyle = "#2C5DD6"; 
			ctx.strokeStyle = "rgba(50, 50, 50, 0.5)";
			ctx.fill();
			ctx.stroke();
			
		ctx.translate(-paddleCenter.x, -paddleCenter.y);
	}

	drawMouseIndicator(ctx) {
		if (this.paddleAnimDir) {
			this.drawPaddle(ctx, this.playerPos.add(this.paddleAnimDir.multiply(this.paddleAnimLength)));
			return;
		}

		if (this.startMousePos === null) { return; }
		if (this.curMousePos === null) { return; }

		let mouseVector = this.curMousePos.subtract(this.startMousePos);
		if (mouseVector.x === 0 && mouseVector.y === 0) { return; }

		let mouseMag = mouseVector.magnitude();
		let indicatorLength = Math.max(Math.min(mouseMag, this.maxMag), 1);
		let mouseUnit = mouseVector.multiply(1/mouseMag);

		let forceProportion =  Math.floor((indicatorLength / this.maxMag) * 255);
		let indicatorStart = this.playerPos.add(mouseUnit.multiply(this.playerRadius));
		let indicatorEnd = this.playerPos.add(mouseUnit.multiply(this.playerRadius + indicatorLength));
		let paddlePos = this.playerPos.add(mouseUnit.multiply(this.playerRadius + indicatorLength + this.playerRadius * 2));

		ctx.strokeStyle = "rgba("+(forceProportion)+", 75, 0, 0.7)";
		ctx.lineWidth = 10;
		ctx.beginPath();
		
		ctx.moveTo(indicatorStart.x, indicatorStart.y);
		ctx.lineTo(indicatorEnd.x, indicatorEnd.y);
		ctx.stroke();
		this.drawPaddle(ctx, paddlePos);
	}

	drawWin(ctx) {
		ctx.fillStyle = "rgba(50, 50, 50, 0.7)";
		ctx.fillRect(0, this.canvas.height / 3, this.canvas.width, (this.canvas.height / 3));
		ctx.font = "50px Impact";
		ctx.fillStyle = "green";
		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;
		ctx.fillText("You Won in " + this.pulseCount + " hits!", 75 + this.border, this.canvas.height / 2 + 20);
		ctx.strokeText("You Won in " + this.pulseCount + " hits!", 75 + this.border, this.canvas.height / 2 + 20);
	}

	drawHUD(ctx) {
		let pulseX = this.canvas.width - 40;
		let pulseY = 35;
		ctx.fillStyle = "rgba(50, 50, 50, 0.7)";
		ctx.fillRect(pulseX - 5, pulseY - 25, 35, 30);
		ctx.font = "25px Impact";
		ctx.fillStyle = "green";
		ctx.strokeStyle = "black";
		ctx.lineWidth = 1;
		ctx.fillText(this.pulseCount, pulseX, pulseY);
		ctx.strokeText(this.pulseCount, pulseX, pulseY);
	}

	drawGoal(ctx) {
		let goalX = ~~((this.cellsAcross -1)/2);
		ctx.fillStyle = "black";
		ctx.fillRect(this.border + goalX * this.cellSize, this.border, this.cellSize, -20);

	}

	/**
	 * Render everything on the canvas
	 */
	drawCanvas() {
		var ctx = this.canvas.getContext("2d");

		// Clear it
		ctx.fillStyle = "#EEEEEE";
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		var img = document.getElementById("table");
		ctx.drawImage(img, 0, 0);

		this.drawRink(ctx);
		this.drawHoles(ctx);
		this.drawWalls(ctx);
		this.drawGoal(ctx);
		
		if (this.gameOver) {
			this.drawWin(ctx);
		} else {
			this.drawPlayer(ctx);
			this.drawMouseIndicator(ctx);
			this.drawHUD(ctx);
		}

		this.drawDebug(ctx);
	}

	impulsePlayer(vector) {
		
		if (this.debug) {
			console.log("Impulse", vector);
		}
		
		if (vector.equals(new Coord(0,0))) {
			this.isAnimating = false;
			return;
		}
		var me = this;
		this.pulseCount++;

		let maxSpeed = 1000; // px/s
		let speedStop = 5; // px/s
		let decel = 200; // px/s/s

		
		let vectMag = vector.magnitude();

		let currentSpeed = Math.min(vectMag / this.maxMag, 1) * maxSpeed;
		let direction = vector.multiply(1/vectMag);

		let clampedDistance = Math.max(Math.min(this.maxMag, vectMag), 1);
		this.paddleAnimDir = vector.multiply(-1/vectMag);
		this.paddleAnimLength = this.playerRadius + clampedDistance + this.playerRadius * 2;
		let paddleSpeed = currentSpeed * 2;

		let lastTime = 0;
		function paddleAnimate(timestamp) {
			if (lastTime <= 0) {
				lastTime = timestamp;
				window.requestAnimationFrame(paddleAnimate);
				return;
			}

			let dt = (timestamp - lastTime)/1000;
			lastTime = timestamp;
			me.paddleAnimLength -= (paddleSpeed * dt);
			// Don't decay the speed since this is the paddle animation

			if (me.paddleAnimLength <= me.playerRadius * 3) {
				me.paddleAnimLength = 0;
				me.paddleAnimDir = null;
				window.requestAnimationFrame(moveStep);
			} else {
				window.requestAnimationFrame(paddleAnimate);
			}
		}
		
		function moveStep(timestamp) {
			if (lastTime <= 0) {
				lastTime = timestamp;
				window.requestAnimationFrame(moveStep);
				return;
			}

			let dt = (timestamp - lastTime)/1000;
			lastTime = timestamp;
			let travelLength = currentSpeed * dt;
			let travel = direction.multiply(travelLength);

			me.collideWalls(travel, direction);

			me.playerPos = me.playerPos.add(travel);

			if (me.playerPos.y < me.border) {
				me.gameOver = true;
				me.playerPos.x = -1000;
				me.playerPos.y = -1000;
				return;
			}

			currentSpeed -= dt*decel;
			if (currentSpeed < speedStop) {
				me.isAnimating = false;
				return;
			}
			window.requestAnimationFrame(moveStep);
		}
		
		window.requestAnimationFrame(paddleAnimate);

	}

	// Log the collision for debugging purposes
	registerDebugCollision(type, surfaceContact, playerPositionContact, reflectVector) {
		if (!this.debug) { return; }

		this.debugCollisions.push({
				type: type,
				wallContact: surfaceContact,
				point: playerPositionContact,
				reflect: reflectVector
			});
			console.log(type + " collision at ", playerPositionContact, " with reflect Unit", reflectVector);
	}

	// Build a list of all possible collisions from this vector
	buildCollisionList(playerVect) {
		let travelLength = playerVect.magnitude();

		let phantomDest = this.playerPos.add(playerVect);
		
		let collisionSet = [];
		for (let idxWall = 0; idxWall < this.walls.length; idxWall++) {
			let curWall = this.walls[idxWall];

			let movementWallIntersect = lineIntersection(
				this.playerPos, phantomDest, 
				curWall[0], curWall[1]);

			let moveToTopWall = null;
			let moveToBottomWall = null;

			// Staircase check these to only do the minimal math needed to establish a collision.
			if (isPointOnLineOnSegment(this.playerPos, phantomDest, movementWallIntersect)
				&& isPointOnLineOnSegment(curWall[0], curWall[1], movementWallIntersect)) {
				// pass through as a collision case
			} else {
				let wallToEndOfMove = closestPointOnLine(curWall[0], curWall[1], phantomDest);
				if (isPointOnLineOnSegment(curWall[0], curWall[1], wallToEndOfMove) 
					&& wallToEndOfMove.subtract(phantomDest).magnitudeSquared() < this.playerRadius*this.playerRadius) {
					// pass through as a collision case
				} else {
					moveToTopWall = closestPointOnLine(this.playerPos, phantomDest, curWall[0]);
					if (isPointOnLineOnSegment(this.playerPos, phantomDest, moveToTopWall) 
						&& moveToTopWall.subtract(curWall[0]).magnitudeSquared() < this.playerRadius*this.playerRadius) {
						// pass through as a collision case
					} else {
						moveToBottomWall = closestPointOnLine(this.playerPos, phantomDest, curWall[1]);
						if (isPointOnLineOnSegment(this.playerPos, phantomDest, moveToBottomWall) 
							&& moveToBottomWall.subtract(curWall[1]).magnitudeSquared() < this.playerRadius*this.playerRadius) {
							// pass through as a collision case
						} else {
							// No collision
							continue;
						}
					}
				}
			}

			let velocityUnit = playerVect.unit();
			let closestWallPoint = closestPointOnLine(curWall[0], curWall[1], this.playerPos);
			let wallDist = closestWallPoint.subtract(this.playerPos).magnitude();
			let vectorDist = movementWallIntersect.subtract(this.playerPos).magnitude();
			let pointAtContact = movementWallIntersect.subtract(velocityUnit.multiply(this.playerRadius * (vectorDist/wallDist)));

			let directWallContact = closestPointOnLine(curWall[0], curWall[1], pointAtContact);
			if (isPointOnLineOnSegment(curWall[0], curWall[1], directWallContact)) {

				// get normal
				let wallNormal = null;
				if (curWall[1].x - curWall[0].x === 0) {
					if (this.playerPos.x < curWall[0].x) {
						wallNormal = new Coord(-1, 0);
					} else {
						wallNormal = new Coord(1, 0);
					}
				} else {
					if (this.playerPos.y < curWall[0].y) {
						wallNormal = new Coord(0, -1);
					} else {
						wallNormal = new Coord(0, 1);
					}
				}

				
				let reflectDirection = velocityUnit.subtract(wallNormal.multiply(2 * velocityUnit.dot(wallNormal)));
				let reflectUnit = reflectDirection.unit();
				let reflectionLength = travelLength - (pointAtContact.subtract(this.playerPos).magnitude());

				collisionSet.push({
					distance: pointAtContact.subtract(this.playerPos).magnitudeSquared(),
					point: pointAtContact,
					surface: directWallContact,
					reflection: reflectUnit.multiply(reflectionLength),
					reflectionUnit: reflectUnit
				});
			} else {
				// Endpoint collision

				// Could path between both endpoints. Need to see which is closer.
				if (moveToTopWall === null) {
					moveToTopWall = closestPointOnLine(this.playerPos, phantomDest, curWall[0]);
				}
				if (moveToBottomWall === null) {
					moveToBottomWall = closestPointOnLine(this.playerPos, phantomDest, curWall[1]);
				}

				let endpoint = null;
				let moveToEndpoint = null;
				let bottomDist = moveToBottomWall.subtract(this.playerPos).magnitudeSquared();
				let topDist = moveToTopWall.subtract(this.playerPos).magnitudeSquared();
				if (bottomDist < topDist) {
					endpoint = curWall[1];
					moveToEndpoint = moveToBottomWall;
				} else {
					endpoint = curWall[0];
					moveToEndpoint = moveToTopWall;
				}

				let distToEndpoint = endpoint.subtract(moveToEndpoint).magnitudeSquared();
				let distBackToCollide = Math.sqrt(distToEndpoint + this.playerRadius*this.playerRadius);
				let distToCollision = moveToEndpoint.subtract(this.playerPos).magnitude() - distBackToCollide;
				let endpointCollision = this.playerPos.add(velocityUnit.multiply(distToCollision));
				let endpointReflectDir = endpointCollision.subtract(endpoint).unit();
				let reflectionLength = travelLength - distToCollision;

				collisionSet.push({
					distance: distToCollision*distToCollision,
					point: endpointCollision,
					surface: endpoint,
					reflection: endpointReflectDir.multiply(reflectionLength),
					reflectionUnit: endpointReflectDir
				});
				
			}

		}
		return collisionSet;
	}

	// Calculate all reflections between draw steps
	collideWalls(playerVect, direction) {
		
		let collisionSet = this.buildCollisionList(playerVect, direction);
		while(collisionSet.length > 0) {
			collisionSet.sort(function comparator(a, b) {
				if (a.distance < b.distance) {
					return -1;
				} else if (a.distance > b.distance) {
					return 1;
				} else {
					return 0;
				}
			});

			let collision = collisionSet[0];
			this.playerPos = collision.point;
			playerVect.x = collision.reflection.x;
			playerVect.y = collision.reflection.y;
			direction.x = collision.reflectionUnit.x;
			direction.y = collision.reflectionUnit.y;

			this.registerDebugCollision(
				"wall",
				collision.surface,
				collision.point,
				collision.reflectionUnit
			);

			collisionSet.length = 0;
			collisionSet = this.buildCollisionList(playerVect, direction);
		}
	}

	onMouseMove(mouseEvent) {
		if (this.isAnimating) {
			return;
		}
		let bounds = this.canvas.getBoundingClientRect();
		this.curMousePos = new Coord(mouseEvent.x - bounds.left, mouseEvent.y - bounds.top);
	}

	onMouseOut(mouseEvent) {
		this.startMousePos = null;
	}

	onMouseUp(mouseEvent) {
		if (this.isAnimating) {
			return;
		}

		if (this.startMousePos == null) {
			return;
		}

		let resultVect = this.startMousePos.subtract(this.curMousePos);
		this.startMousePos = null;
		this.isAnimating = true;
		this.impulsePlayer(resultVect);
	}

	onMouseDown(mouseEvent) {
		if (this.isAnimating) {
			return;
		}
		if (this.gameOver) {
			return;
		}
		let bounds = this.canvas.getBoundingClientRect();
		this.startMousePos = new Coord(mouseEvent.x - bounds.left, mouseEvent.y - bounds.top);
		if (this.debug) {
			console.log("clickAt", this.startMousePos);	
		}
	}

}

/**
Browser Functions
**/
window.onload = function onload() {
	var mazeCanvas = document.getElementById("maze");
	var mazeGame = new MazeGame(mazeCanvas);
}