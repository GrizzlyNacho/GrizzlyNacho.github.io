/*
 * Contain as much of the heavy lifting math here as possible
 * Big thanks to: 
 * http://ericleong.me/research/circle-line/ 
 * http://ericleong.me/research/circle-circle/
 * for the refresher on applicable linear agebra
 */

// Can be used as a 2d position or a 2d vector
class Coord {
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}

	add(otherCoord) {
		return new Coord(this.x + otherCoord.x, this.y + otherCoord.y);
	}

	subtract(otherCoord) {
		return new Coord(this.x - otherCoord.x, this.y - otherCoord.y);
	}

	equals(otherCoord) {
		return this.x === otherCoord.x && this.y === otherCoord.y;
	}

	multiply(factor) {
		return new Coord(this.x * factor, this.y * factor);
	}

	unit() {
		return this.multiply(1/this.magnitude());
	}

	magnitude() {
		return Math.sqrt(this.magnitudeSquared());
	}

	magnitudeSquared() {
		return this.x*this.x + this.y*this.y;
	}

	cross(otherCoord) {
		return this.x*otherCoord.y - this.y*otherCoord.x;
	}

	dot(otherCoord) {
		return this.x*otherCoord.x + this.y*otherCoord.y;
	}
}


/**
 * Determine where two lines intersect
 * @param {Coord} l11 First point of the first line.
 * @param {Coord} l12 Second point of the first line.
 * @param {Coord} l21 First point of the second line.
 * @param {Coord} l22 Second point of the second line
 */
function lineIntersection(l11, l12, l21, l22) {
	let A1 = l12.y - l11.y;
	let B1 = l11.x - l12.x;
	let C1 = A1*l11.x + B1*l11.y;

	let A2 = l22.y - l21.y;
	let B2 = l21.x - l22.x;
	let C2 = A2 * l21.x + B2 * l21.y;
	let det = A1 * B2 - A2 * B1;
	if(det === 0){
		return null;
	}
	let x = (B2 * C1 - B1 * C2) / det;
	let y = (A1 * C2 - A2 * C1) / det;
	return new Coord(x, y);
}

/**
 * Is the point on a line on the segment provided?
 * @param l1 the first point describing the segment
 * @param l2 the second point describing the segment
 * @param p the point that is known to be on the line
 */
function isPointOnLineOnSegment(l1, l2, p) {
	return p.x >= Math.min(l1.x, l2.x) && p.x <= Math.max(l1.x, l2.x) 
			&& p.y >= Math.min(l1.y, l2.y) && p.y <= Math.max(l1.y, l2.y);
}


/**
 * Find the closest point on a line to a point.
 * @param l1 - the first point on the line
 * @param l2 - the second point on the line
 * @param p - the point being compared
 */
function closestPointOnLine(l1, l2, p) { 
	let A1 = l2.y - l1.y; 
	let B1 = l1.x - l2.x; 
	let C1 = (l2.y - l1.y)*l1.x + (l1.x - l2.x)*l1.y; 
	let C2 = -B1*p.x + A1*p.y; 
	let det = A1*A1 - (-B1*B1); 
	let cx = 0; 
	let cy = 0; 
	if(det != 0){ 
		cx = (A1 * C1 - B1 * C2) / det; 
		cy = (A1 * C2 - -B1 * C1) / det; 
	} else { // It's on the line 
		cx = p.x; 
		cy = p.y; 
	} 
	return new Coord(cx, cy); 
}