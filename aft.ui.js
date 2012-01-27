$(document).ready(function() {
	
	// activate option tabs
	$('#option_tabs').tabs();
	
	$('#graph').dialog({ width: 800, height: 400, autoOpen: false });
	$('#open_graph').click(function() {
		$('#graph').dialog('open');
	});
	
	// activate option sliders
	
	$('#single_phi_slider').slider({
		value: 1.0,
		min: 0,
		max: 5.0,
		step: 0.1,
		slide: function( event, ui ) {
			$('#single_phi_value').val( ui.value );
		}
	});
	$('#single_phi_value').val( $('#single_phi_slider').slider('value') );
	
	$('#multi_phi_slider').slider({
		range: true,
		min: 0,
		max: 5.0,
		step: 0.1,
		values: [ 0.5, 2.0 ],
		slide: function( event, ui ) {
			$('#multi_phi_value_min').val( ui.values[ 0 ] );
			$('#multi_phi_value_max').val( ui.values[ 1 ] );
		}
	});
	$('#multi_phi_value_min').val( $('#multi_phi_slider').slider('values', 0) );
	$('#multi_phi_value_max').val( $('#multi_phi_slider').slider('values', 1) );
	
	
	// toggle table content button
	$('.toggle button').click(function() { $(this).parents('table').children('tbody').toggle(); });
	
	// calculate heating value
	var heating_value = HV({ 'reactants': { 'CO': 1, 'O2': 0.5 }, 'products': { 'CO2': 1 } }, 'CO');
	$('#intro .heating_value.molar_basis').text( round( heating_value, 4 ) );
	$('#intro .heating_value.mass_basis').text( round( mol_to_mass( heating_value, 'CO' ), 4 ) );
	
	$options = $('#options');
	
	$single_phi_data = $('#single_phi_data');
	$single_phi_data.hide();
	
	$('#single_phi_calc').click(function() {
		
		$single_phi_data.fadeIn();
		$multi_phi_data.fadeOut();
		
		var phi = parseFloat( $options.find('#single_phi_value').val() );
		var equation = getEquation( phi );
		
		$single_phi_data.find('.phi_value').text( phi );
		
		$single_phi_data.find('.equation .reactants .v_CO').text( round(equation.reactants.CO, 4) );
		$single_phi_data.find('.equation .reactants .v_O2').text( round(equation.reactants.O2, 4) );
		$single_phi_data.find('.equation .products .v_CO2').text( round(equation.products.CO2, 4) );
		$single_phi_data.find('.equation .products .v_CO').text( round(equation.products.CO, 4) );
		$single_phi_data.find('.equation .products .v_O2').text( round(equation.products.O2, 4) );
		( equation.products.CO == 0 ) ? $single_phi_data.find('.equation .products .CO').hide() : $single_phi_data.find('.equation .products .CO').show();
		( equation.products.O2 == 0 ) ? $single_phi_data.find('.equation .products .O2').hide() : $single_phi_data.find('.equation .products .O2').show();
		
		$single_phi_data.find('.flame_temp_value').text( round( flameTemp( phi ), 4 ) );
		
	});
	
	$multi_phi_data = $('#multi_phi_data');
	$multi_phi_data.hide();
	
	$('#multi_phi_calc').click(function() {
	
		$multi_phi_data.fadeIn();
		$single_phi_data.fadeOut();
		
		$multi_phi_data.find('.calc-row').remove();
		
		var phi = {
			'min': parseFloat( $options.find('#multi_phi_value_min').val() ),
			'max': parseFloat( $options.find('#multi_phi_value_max').val() ),
			'step': 0.100
		}
		
		for ( phi.i = phi.min; phi.i <= phi.max; phi.i += phi.step ) {
			
			phi.i = round(phi.i,2);
			
			$multi_phi_data.children('tbody').append('<tr class="calc-row"><td class="label">' + phi.i + '</td><td class="value">' + round( flameTemp(phi.i), 4 ) + '</td></tr>');
			
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