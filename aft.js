	
var Cp = function(T) {
	return a(T)[0] * pow(T,-2) + a(T)[1] * pow(T,-1) + a(T)[2] + a(T)[3] * T + a(T)[4] * pow(T,2) + a(T)[5] * pow(T,3) + a(T)[6] * pow(T,4);
}