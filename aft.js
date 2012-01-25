
/*
	molecules = {
		'CO': 1,
		'O2': 0.5,
		'CO2': -1
	}
*/
var HV = function(molecules) {
	var x = 0;
	$.each(molecules, function(molecule,n) {
		x += n * K(molecule, T_ref).H;
	});
	return x;
}