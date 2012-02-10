
/*
 * getEquation
 * Return the reaction equation for a given phi.
 * @phi		Fuel Equivalence Ratio
 * @FOR_st	Fuel to Oxidizer Ratio (Stoichiometric)
 * @considerDissociation
 * @allowedEntities
 * @return	Object Reaction equation
 */

var getEquation = function(phi, FOR_st, T, P, considerDissociation, allowedEntities) {

	var FOR_act = phi * FOR_st;

	var nFuel = 1;
	var nOxi = nFuel / FOR_act;
	
	var equation = {};
	
	equation.reactants = { 'CO': nFuel, 'O2': nOxi };
	
	if ( typeof considerDissociation == 'undefined' || !considerDissociation ) {
		
		// Stoichiometric (No excess)
		if ( phi == 1 )
			equation.products = { 'CO2': nFuel, 'CO': 0, 'O2': 0, 'O': 0 };
		// Fuel Lean (Excess Oxidizer)
		else if ( phi < 1 )
			equation.products = { 'CO2': nFuel, 'CO': 0, 'O2': ( nFuel * ( 1 / FOR_act - 1 / 2 ) ), 'O': 0 };
		// Fuel Rich (Excess Fuel)
		else
			equation.products = { 'CO2': ( 2 * nFuel / FOR_act ), 'CO': ( nFuel * ( 1 - 2 / FOR_act ) ), 'O2': 0, 'O': 0 };
	
	}
	
	else if ( typeof T != 'undefined' && typeof P != 'undefined' && typeof allowedEntities != 'undefined' )
		equation.products = dissociateProducts(T, P, equation.reactants, allowedEntities);
	
	else
		return false;
		
	return equation;
	
};

/*
 * getdH
 * Get the difference in enthalpy between the reactants and the products of a given reaction.
 * @equation	Object Reaction equation
 * @T_products	Float Products temperature
 * @T_reactants	Float Reactants temperature
 * @return		Float Enthalpy difference between reactants and products
 */

var getdH = function(equation, T_products, T_reactants) {
	
	if ( typeof T_reactants == 'undefined' ) T_reactants = T_ref;
	
	var dH = 0;
	
	$.each(equation.reactants, function(entity, n) {
		dH += n ? n * K(entity, T_reactants).H : 0;
	});
	
	$.each(equation.products, function(entity, n) {
		dH -= n ? n * K(entity, T_products).H : 0;
	});
	
	return dH;
	
};

/*
 * HV
 * Calculates the Heating Value
 *
 * @equation	Object Chemical equation to be analyzed
 * 				1 CO + 0.5 CO2 => 1 CO2 is equivalent to
 * 				{ 'reactants': { 'CO': 1, 'O2': 0.5 }, 'products': { 'CO2': 1 } }
 * @fuel		String Reaction Fuel entity (e.g. 'CO')
 * @return		Float Heating Value in kJ/kmol
 * Note: make sure your equation is stoichiometric
 */

var HV = function(equation, fuel) {
	var nFuel = equation.reactants[fuel];
	var dH = getdH(equation, T_ref, T_ref);
	return dH / nFuel;
};


/*
 * flameTemp
 * Calculates the adiabatic flame temperature given a fuel equivalence ratio
 * @phi		Float Fuel Equivalence Ratio
 * @return	Float Flame Temperature in Kelvins
 */

var flameTemp = function(phi, P, considerDissociation, allowedEntities) {

	var FOR_st = 2; // Value for Carbon Monoxy - Oxygen (this will eventually be a UI option)
	
	return bisection({
		fct: function(T) {
			var equation = getEquation( phi, FOR_st, T, P, considerDissociation, allowedEntities );
			return getdH( equation , T );
		},
		range: {
			min: T_ref,
			max: 10000
		},
		maxIterations: 50,
		stepSize: 1,
		error: 0.01
	});

};

/*
 * explodeEntity
 * Make soup of elements from entity
 */

var explodeEntity = function(entity) {
		
	var soup = {};
	
	var coeffs = entity.split(/[A-Z]/).splice(1,entity.length);
	var symbols = entity.replace(/[0-9]/g, '');
	
	// Fix coeffs: replace strings by numbers
	$.each(coeffs, function(i, v) {
		coeffs[i] = ( v == '' ) ? 1 : parseFloat(v);
	})
	
	$.each(symbols, function(i, el) {
		if ( typeof soup[el] == 'undefined' ) soup[el] = 0;
		soup[el] += coeffs[i];
	});
	
	return soup;
	
};


/*
 * explodeEntities
 * Make soup of elements from a list of entities
 */

var explodeEntities = function(entities) {

	var soup = [];

	$.each(entities, function(entity, n) {
		soup.push( objectWalk(function(x) { return n*x; }, explodeEntity(entity)) );
	});

	return objectsCombinedSum(soup);
	
};


/*
 * getG
 * Get (total?) Gibbs free energy for entities in a mix.
 * @T			Temperature (K)
 * @P			Pressure (atm)
 * @entities	Entities studied and their amount: e.g. { CO2: 0.2, CO: 0.15, O2: 0.5, O: 0.35 }
 * @getTotal	Do you want total Gibbs energy?
 */

var getG = function(T, P, entities, getTotal) {
	var N = objectSum(entities);
	var o = {};
	$.each(entities, function(entity, n) {
		o[entity] = n ? n * K(entity, T, (P * n / N)).G : 0;
	});
	return ( getTotal ) ? objectSum(o) : o;
};


/*
 * gibbsMinimization
 * Given a temperature, a pressure, entities analyzed/allowed and initial reactants,
 * this function will return the equilibrium composition, accounting for dissociation.
 * @T			Temperature (K)
 * @P			Pressure (atm)
 * @entities	Entities studied and their amount: e.g. { CO2: 0.2, CO: 0.15, O2: 0.5, O: 0.35 }
 * @reactants	Initial reaction reactants: e.g. { CO: 1, O2: 0.7 }
 * @return		Entities equilibrium composition (same format as @entities)
 */

window.gibbsi = 0;

var gibbsMinimization = function(T, P, entities, reactants) {

	window.gibbsi++;
	
	var species = entities;
	var elements = explodeEntities( entities );
	
	var nSpecies = objectSize( species );
	var nElements = objectSize( elements );
	
	var matrixSize = nSpecies + nElements + 1;
	
	var i, j;
	
	// Populate Matrix with zeros first
	var matrix = new Array(matrixSize);
	for ( i = 0; i < matrixSize; i++ ) {
		matrix[i] = new Array(matrixSize);
		for ( j = 0; j < matrixSize; j++ )
			matrix[i][j] = 0;
	}
	
	for ( i = 0; i < nSpecies; i++ ) {
		matrix[i][i] = 1;
		matrix[i][matrixSize-1] = -1;
	}
	
	i = nSpecies;
	$.each(elements, function(element, n) {
		j = 0;
		$.each(entities, function(entity, m) {
			var explodedEntity = explodeEntity(entity);
			matrix[j][i] = ( typeof explodedEntity[element] != 'undefined' ) ? -explodedEntity[element] : 0;
			matrix[i][j] = ( typeof explodedEntity[element] != 'undefined' ) ? explodedEntity[element] * m : 0;		
			matrix[i+1][j] = ( typeof explodedEntity[element] != 'undefined' ) ? m : 0;
			j++;
		});
		i++;
	});
	
	matrix[matrixSize-1][matrixSize-1] = -objectSum(entities);
	
	var b = new Array();
	
	var g = getG(T, P, entities);
	
	i = 0;
	$.each(entities, function(entity, n) {
		b[i++] = -g[entity] / ( n * R * T );
	});
	
	i = nSpecies;
	$.each(elements, function(element, n) {
		var m = explodeEntities(reactants)[element];
		for ( j = 0; j < nSpecies; j++ )
			m -= matrix[i][j];
		b[i++] = m;
	});
	
	b[matrixSize-1] = 0;
	
	var invMatrix = invertMatrix( matrix );
	
	var corrArr = matrixMult( invMatrix, b );
	
	var testCorrArr = function(arr) {
		for ( i = 0; i < nSpecies; i++ ) {
			if ( Math.abs(arr[i]) > 0.01 )
				return false;
		}
		return true;
	};
	
	// We have converged
	if ( testCorrArr( corrArr ) ) {
		return entities;
	}
	
	// Try again (recursively)
	else {
		var newEntities = {};
		i = 0;
		$.each(entities, function(entity, n) {
			newEntities[entity] = Math.exp( Math.log( n ) + corrArr[i++] );
		});
		return gibbsMinimization(T, P, newEntities, reactants);
	}
	
};


/*
 * dissociateProducts
 * Given a temperature, a pressure, initial reactants and a list of allowed entities, a list of
 * dissociated products at equilibrium with their respective quantities is returned.
 * @T				Temperature (K)
 * @P				Pressure (atm)
 * @reactants		Initial reaction reactants: e.g. { CO: 1, O2: 0.7 }
 * @allowedEntities	List of allowed entities to appear: e.g. ['CO2', 'CO' 'O2', 'O']
 * @return			Product entities at equilibrium composition
 */

var dissociateProducts = function(T, P, reactants, allowedEntities) {
	
	// Initial guess
	var products = {};
	$.each(allowedEntities, function(i, entity) {
		products[entity] = 0.1;
	});
	
	// Minimize
	products = gibbsMinimization(T, P, products, reactants);
	
	return products;
	
};



