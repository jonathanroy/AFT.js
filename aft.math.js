// Shortcut for power: x^n = pow(x,n)
var pow = function(x,n) {
	return Math.pow(x,n);
};

// Shortcut for scientific notation: E(n) = 10^n
var E = function(n) {
	return Math.pow(10,n);
};

var round = function (num, dec) {
	var result = Math.round(num*Math.pow(10,dec))/Math.pow(10,dec);
	return result;
};

// Return new array with duplicate values removed
Array.prototype.unique = function() {
	var a = [];
	var l = this.length;
	for ( var i = 0; i < l; i++ ) {
		for ( var j = i + 1; j < l; j++ ) {
			// If this[i] is found later in the array
			if ( this[i] === this[j] ) j = ++i;
		}
		a.push(this[i]);
	}
	return a;
};

var objectWalk = function(fct, obj) {
	var o = {};
	$.each(obj, function(i, v) {
		o[i] = fct(v);
	});
	return o;
};

var objectSum = function(object) {
	var sum = 0;
	$.each(object, function(i, v) { sum += ( typeof v == 'number' ) ? v : 0; });
	return sum;
};

var objectsCombinedSum = function(arr) {
	var combinedObject = {};
	$.each(arr, function(i, object) {
		$.each(object, function(property, value) {
			if ( typeof combinedObject[property] == 'undefined' ) combinedObject[property] = 0;
			combinedObject[property] +=  value;
		});
	});
	return combinedObject;
};

var objectSize = function(object) {
	var size = 0;
	$.each(object, function(p,v) {
		size++;
	});
	return size;
};

/*
 * bisection
 * Performs bisection on a function to return of one its zero on the given range.
 * @args	fct, range, maxIterations, stepSize, error	Object
 * @return 	closest approximation to the zero of the function over the range
 */

var bisection = function(args) {
	
	var fct = args.fct,
		range = args.range,
		maxIterations = args.maxIterations,
		stepSize = args.stepSize,
		error = args.error;
	
	var val = {};
	
	var i = 0;
	
	while ( i < maxIterations ) {
		
		range.mid = ( ( range.min + range.max ) / 2.0 );
		
		val = {
			min: fct(range.min),
			mid: fct(range.mid),
			max: fct(range.max)
		};
		
		if ( Math.abs( ( val.max - val.min ) / 2 ) <= error ) break;
		
		( ( val.min * val.mid ) > 0 ) ? range.min = range.mid : range.max = range.mid;
		
		i += stepSize;
		
	}
	
	return range.mid;
	
};


var invertMatrix = function (matrix) {
	var ratio, a;
	var i, j, k;
	var n = matrix.length;
	var invMatrix = matrix;
	for ( i = 0; i < n; i++ ) {
		for ( j = n; j < 2*n; j++ )
			invMatrix[i][j] = ( i == (j-n) ) ? 1.0 : 0.0;
	}
	for ( i = 0; i < n; i++ ) {
		for ( j = 0; j < n; j++ ) {
			if ( i != j ) {
				ratio = invMatrix[j][i]/invMatrix[i][i];
				for (k = 0; k < 2*n; k++ ) 
					invMatrix[j][k] -= ratio * invMatrix[i][k];
			}
		}
	}
	for ( i = 0; i < n; i++ ) {
		a = invMatrix[i][i];
		for ( j = 0; j < 2*n; j++ )
			invMatrix[i][j] /= a;
	}
	for ( i = 0; i < n; i++ )
		invMatrix[i].splice(0,n);
	return invMatrix;
};


var matrixMult = function(matrix, vector) {
	
	var i, j;
	var m = matrix.length;
	var n = vector.length;
	var R = new Array(n);
	
	for ( i = 0; i < m; i++ ) {
		R[i] = 0;
		for ( j = 0; j < n; j++ ) {
			R[i] += matrix[i][j] * vector[j];
		}
	}
	return R;
};