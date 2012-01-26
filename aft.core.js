
/*
 * HV
 * Calculates the Heating Value
 *
 * @equation Object Chemical equation to be analyzed
 * 1 CO + 0.5 CO2 => 1 CO2
 * is equivalent to
 * { 'reactants': { 'CO': 1, 'O2': 0.5 }, 'products': { 'CO2': 1 } }
 *
 * Notes:	- make sure your equation is stoichiometric,
 * 			- always put your fuel first.
 */

var HV = function(equation) {
	var H = 0;
	var nFuel = 0;
	$.each(equation.reactants, function(entity, n) {
		if ( !nFuel ) nFuel = n;
		H += n * K(entity, T_ref).H;
	});
	$.each(equation.products, function(entity, n) {
		H -= n * K(entity, T_ref).H;
	});
	return H / nFuel;
}

/*
 * getEquation
 *
 * @phi Fuel Equivalence Ratio
 * @return Object Equation
 */

var getEquation = function(phi) {

	var FOR_st = 2; // Fuel to Oxidizer Ratio (Stoichiometric)
	var FOR_act = phi * FOR_st;

	var nFuel = 1;
	var nOxi = nFuel / FOR_act;
	
	// Stoichiometric (No excess)
	if ( phi == 1 ) {
		var nProduct = nFuel;
		var nExcessFuel = 0;
		var nExcessOxi = 0;
	}
	// Fuel Lean (Excess Oxidizer)
	else if ( phi < 1 ) {
		var nProduct = nFuel;
		var nExcessFuel = 0;
		var nExcessOxi = nFuel * ( 1 / FOR_act - 1 / 2 );
	}
	// Fuel Rich (Excess Fuel)
	else {
		var nProduct = 2 * nFuel / FOR_act;
		var nExcessFuel = nFuel * ( 1 - 2 / FOR_act );
		var nExcessOxi = 0;
	}
	
	return {
		'reactants': {
			'CO': nFuel,
			'O2': nOxi
		},
		'products': {
			'CO2': nProduct,
			'CO': nExcessFuel,
			'O2': nExcessOxi
		}
	};
	
}

var getdH = function(equation, T_products, T_reactants) {
	
	if ( typeof T_reactants == 'undefined' ) T_reactants = T_ref;
	
	var H = 0;
	
	$.each(equation.reactants, function(entity, n) {
		H += n ? n * K(entity, T_reactants).H : 0;
	});
	
	$.each(equation.products, function(entity, n) {
		H -= n ? n * K(entity, T_products).H : 0;
	});
	
	return H;
	
}

var flameTemp = function(phi) {

	var equation = getEquation(phi);
	
	var error = 0.01;
	
	var T = { 'low': T_ref, 'mid': null, 'high': 10000 };
	var dH = {};
	
	var control = { 'i': 0, 'max': 50 };
	
	while ( control.i++ < control.max ) {
		
		T.mid = ( T.low + T.high ) / 2;
		
		dH = { 'low': getdH(equation, T.low), 'mid': getdH(equation, T.mid), 'high': getdH(equation, T.high) };
		
		if ( ( ( T.high - T.low ) / 2 ) <= error ) break;
		
		( ( dH.low * dH.mid ) > 0 ) ? T.low = T.mid : T.high = T.mid;
		
	}
	
	return T.mid;
	
}