$(document).ready(function() {
	
	// activate option tabs
	$('#option_tabs').tabs();
	
	$('#graph').dialog({
		width: 830,
		height: 445,
		autoOpen: false
	});
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
		$multi_phi_data.hide();
		
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
		$single_phi_data.hide();
		
		$multi_phi_data.find('.calc-row').remove();
		
		var phi = {
			'min': parseFloat( $options.find('#multi_phi_value_min').val() ),
			'max': parseFloat( $options.find('#multi_phi_value_max').val() ),
			'step': 0.100
		}
		
		var data = [];
		
		for ( phi.i = phi.min; phi.i <= phi.max; phi.i += phi.step ) {
			
			phi.i = round(phi.i,2);
			
			var temp = round( flameTemp(phi.i), 4);
			
			$multi_phi_data.children('tbody').append('<tr class="calc-row"><td class="label">' + phi.i + '</td><td class="value">' + temp + '</td></tr>');
			
			data.push( [ phi.i, temp ] );
		}
		
		graph.series[0].setData( data );
		
	});
	
	graph = new Highcharts.Chart({
		chart: {
			renderTo: 'flame_temp_graph_container',
			defaultSeriesType: 'line',
		},
		title: {
			text: 'Flame Temperature vs. Fuel Equivalence Ratio',
			x: -20 //center
		},
		legend: {
			enabled: false
		},
		xAxis: {
			title: {
				enabled: true,
				text: 'Fuel Equivalence Ratio',
				margin: 40
			}
		},
		yAxis: {
			title: {
				text: 'Flame Temperature [K]',
				margin: 60
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
		series: [{
			data: []
		}],
		credits: {
			enabled: false
		}
	});
	
});