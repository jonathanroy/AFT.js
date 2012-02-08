
var consoleLogMatrix = function(matrix) {
	var s = "";
	$.each(matrix, function(i, row) {
		$.each(row, function(j, val) {
			s += round(val,3) + "\t";
		});
		s += "\n";
	});
	console.log(s);
};