$(document).ready(function() {
	
	var heating_value = HV({ 'reactants': { 'CO': 1, 'O2': 0.5 }, 'products': { 'CO2': 1 } });
	$('#intro .heating_value.molar_basis').text( round( heating_value, 4 ) );
	$('#intro .heating_value.mass_basis').text( round( mol_to_mass( heating_value, 'CO' ), 4 ) );
	
	$SinglePhi = $('#SinglePhi');
	$SinglePhi.children('tbody').hide();
	
	$SinglePhi.find('thead button').click(function() {
	
		$SinglePhi.children('tbody').show();
		
		var phi = parseFloat( $SinglePhi.find('thead .phi').val() );
		var equation = getEquation( phi );
		
		$SinglePhi.find('.equation .reactants .v_CO').text( round(equation.reactants.CO, 4) );
		$SinglePhi.find('.equation .reactants .v_O2').text( round(equation.reactants.O2, 4) );
		$SinglePhi.find('.equation .products .v_CO2').text( round(equation.products.CO2, 4) );
		$SinglePhi.find('.equation .products .v_CO').text( round(equation.products.CO, 4) );
		$SinglePhi.find('.equation .products .v_O2').text( round(equation.products.O2, 4) );
		( equation.products.CO == 0 ) ? $SinglePhi.find('.equation .products .CO').hide() : $SinglePhi.find('.equation .products .CO').show();
		( equation.products.O2 == 0 ) ? $SinglePhi.find('.equation .products .O2').hide() : $SinglePhi.find('.equation .products .O2').show();
		
		$SinglePhi.find('.flame_temp .value input').val( round(flameTemp(phi), 4) );
		
	});
	
	$MultiPhi = $('#MultiPhi');
	$MultiPhi.children('tbody').hide();
	
	$MultiPhi.find('thead button').click(function() {
	
		$MultiPhi.children('tbody').show();
		
		var phi = {
			'min': parseFloat( $MultiPhi.find('thead .phi_min').val() ),
			'max': parseFloat( $MultiPhi.find('thead .phi_max').val() ),
			'step': 0.100
		}
		
		console.log(phi);
		
		for ( phi.i = phi.min; phi.i <= phi.max; phi.i += phi.step ) {
			
			phi.i = round(phi.i,2);
			
			//console.log(phi.i, flameTemp(phi.i));
			$MultiPhi.children('tbody').append('<tr><td>' + phi.i + '</td><td>' + flameTemp(phi.i) + '</td></tr>');
			
		}
		
	});
	
	flame_temp_graph = new Highcharts.Chart({
		chart: {
			renderTo: 'flame_temp_graph_container',
			defaultSeriesType: 'line',
			marginRight: 130,
			marginBottom: 25
		},
		title: {
			text: 'Flame Temperature vs. Fuel Equivalence Ratio',
			x: -20 //center
		},
		xAxis: {
			categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
				'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
		},
		yAxis: {
			title: {
				text: 'Temperature (°C)'
			},
			plotLines: [{
				value: 0,
				width: 1,
				color: '#808080'
			}]
		},
		tooltip: {
			formatter: function() {
					return 'FlameTemp(' + this.x + ') = ' + this.y;
			}
		},
		legend: {
			layout: 'vertical',
			align: 'right',
			verticalAlign: 'top',
			x: -10,
			y: 100,
			borderWidth: 0
		},
		series: [{
			name: 'Tokyo',
			data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
		}, {
			name: 'New York',
			data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
		}, {
			name: 'Berlin',
			data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
		}, {
			name: 'London',
			data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
		}]
	});
	
});