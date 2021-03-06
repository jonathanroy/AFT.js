// Universal Gas Constant
var R = 8.314;

// Reference State
var T_ref = 298.15; // K
var P_ref = 1.000; // atm

var K = function(entity, T, P) {

	if ( typeof T != 'number' || T < 0 ) T = T_ref;
	
	if ( typeof P != 'number' || P < 0 ) P = P_ref;
	
	if ( typeof entity != 'string' ) {
		alert('ERROR: Invalid entity!');
		return false;
	}
	
	switch ( entity ) {
	
		// Molecular Oxygen
		case 'O2' :
			if ( T < 1000 ) {
				this.a = [ -3.425563420*E(4), 4.847000970*E(2), 1.119010961, 4.293889240*E(-3), -6.836300520*E(-7), -2.023372700*E(-9), 1.039040018*E(-12) ];
				this.b = [ -3.391454870*E(3), 1.849699470*E(1) ];
			}
			else if ( T < 6000 ) {
				this.a = [ -1.037939022*E(6), 2.344830282*E(3), 1.819732036, 1.267847582*E(-3), -2.188067988*E(-7), 2.053719572*E(-11), -8.193467050*E(-16) ];
				this.b = [ -1.689010929*E(4), 1.738716506*E(1) ];
			}
			else {
				this.a = [ 4.975294300*E(8), -2.866106874*E(5), 6.690352250*E(1), -6.169959020*E(-3), 3.016396027*E(-7), -7.421416600*E(-12), 7.278175770*E(-17) ];
				this.b = [ 2.293554027*E(6), -5.530621610*E(2) ];
			}
			break;
		
		// Atomic Oxygen
		case 'O' :
			if ( T < 1000 ) {
				this.a = [ -7.953611300*E(3), 1.607177787*E(2), 1.966226438, 1.013670310*E(-3), -1.110415423*E(-6), 6.517507500*E(-10), 1.584779251*E(-13) ];
				this.b = [ 2.840362437*E(4), 8.404241820 ];
			}
			else if ( T < 6000 ) {
				this.a = [ 2.619020262*E(5), -7.298722030*E(2), 3.317177270, -4.281334360*E(-4), 1.036104594*E(-7), -9.438304330*E(-12), 2.725038297*E(-16) ];
				this.b = [ 3.392428060*E(4), -6.679585350*E(-1) ];
			}
			else {
				this.a = [ 1.779004264*E(8), -1.082328257*E(5), 2.810778365*E(1), -2.975232262*E(-3), 1.854997534*E(-7), -5.796231540*E(-12), 7.191720164*E(-17) ];
				this.b = [ 8.890942630*E(5), -2.181728151*E(2) ];
			}
			break;
		
		// Carbon Monoxide
		case 'CO' :
			this.M = 28.010;
			if ( T < 1000 ) {
				this.a = [ 1.489045326*E(4), -2.922285939*E(2), 5.724527170, -8.176235030*E(-3), 1.456903469*E(-5), -1.087746302*E(-8), 3.027941827*E(-12) ];
				this.b = [ -1.303131878*E(4), -7.859241350 ];
			}
			else if ( T < 6000 ) {
				this.a = [ 4.619197250*E(5), -1.944704863*E(3), 5.916714180, -5.664282830*E(-4), 1.398814540*E(-7), -1.787680361*E(-11), 9.620935570*E(-16) ];
				this.b = [ -2.466261084*E(3), -1.387413108*E(1) ];
			}
			else {
				this.a = [ 8.868662960*E(8), -7.500377840*E(5), 2.495474979*E(2), -3.956351100*E(-2), 3.297772080*E(-6), -1.318409933*E(-10), 1.998937948*E(-15) ];
				this.b = [ 5.701421130*E(6), -2.060704786*E(3) ];
			}
			break;
			
		// Carbon Dioxide
		case 'CO2' :
			if ( T < 1000 ) {
				this.a = [ 4.943650540*E(4), -6.264116010*E(2), 5.301725240, 2.503813816*E(-3), -2.127308728*E(-7), -7.689988780*E(-10), 2.849677801*E(-13) ];
				this.b = [ -4.528198460*E(4), -7.048279440 ];
			}
			else if ( T < 6000 ) {
				this.a = [ 1.176962419*E(5), -1.788791477*E(3), 8.291523190, -9.223156780*E(-5), 4.863676880*E(-9), -1.891053312*E(-12), 6.330036590*E(-16) ];
				this.b = [ -3.908350590*E(4), -2.652669281*E(1) ];
			}
			else {
				this.a = [ -1.544423287*E(9), 1.016847056*E(6), -2.561405230*E(2), 3.369401080*E(-2), -2.181184337*E(-6), 6.991420840*E(-11), -8.842351500*E(-16) ];
				this.b = [ 5.701421130*E(6), -2.060704786*E(3) ];
			}
			break;
			
	}
	
	// Specific heat at constant pressure
	this.Cp = R * ( this.a[0] * pow(T,-2) + this.a[1] * pow(T,-1) + this.a[2] + this.a[3] * T + this.a[4] * pow(T,2) + this.a[5] * pow(T,3) + this.a[6] * pow(T,4) );
	
	// Enthalpy
	this.H = R * T * ( -this.a[0] * pow(T,-2) + this.a[1] * Math.log(T) * pow(T,-1) + this.a[2] + this.a[3] * T / 2 + this.a[4] * pow(T,2) / 3 + this.a[5] * pow(T,3) / 4 + this.a[6] * pow(T,4) / 5 + this.b[0] / T );

	// Entropy at P_ref
	this.S0 = R * ( -this.a[0] * pow(T,-2) / 2 - this.a[1] * pow(T,-1) + this.a[2] * Math.log(T) + this.a[3] * T + this.a[4] * pow(T,2) / 2 + this.a[5] * pow(T,3) / 3 + this.a[6] * pow(T,4) / 4 + this.b[1] );
	
	// Entropy
	this.S = this.S0 - R * Math.log( P / P_ref );
	
	// Gibbs free energy
	this.G = this.H - T * this.S;
	
	return this;
}

/*
 * mol_to_mass
 * Converts from molar basis to mass basis
 * @n		Number of moles
 * @entity	Which molecule/atom is it?
 * @return 	mass basis value
 */

var mol_to_mass = function(n, entity) {
	return n / K(entity).M;
}