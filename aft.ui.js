$(document).ready(function() {
	
	// initialize option tabs
	$phi_option_tabs = $('#phi_option_tabs').tabs();
	$pressure_option_tabs = $('#pressure_option_tabs').tabs();
	
	// initialize dialog window
	$('#graph').dialog({ width: 830, height: 445, autoOpen: false });
	$('#open_graph').click(function() { $('#graph').dialog('open'); });
	$('#open_graph').hide();
	
	// activate option sliders
	$('#single_phi_slider').slider({ value: 1.0, min: 0, max: 5.0, step: 0.1, slide: function( event, ui ) { $('#single_phi_value').val( ui.value ); } });
	$('#single_phi_value').val( $('#single_phi_slider').slider('value') );
	$('#multi_phi_slider').slider({ range: true, min: 0, max: 5.0, step: 0.1, values: [ 0.5, 2.0 ], slide: function( event, ui ) { $('#multi_phi_value_min').val( ui.values[ 0 ] ); $('#multi_phi_value_max').val( ui.values[ 1 ] ); } });
	$('#multi_phi_value_min').val( $('#multi_phi_slider').slider('values', 0) );
	$('#multi_phi_value_max').val( $('#multi_phi_slider').slider('values', 1) );
	$('#single_pressure_slider').slider({ value: 1.0, min: 0.25, max: 10.0, step: 0.25, slide: function( event, ui ) { $('#single_pressure_value').val( ui.value ); } });
	$('#single_pressure_value').val( $('#single_pressure_slider').slider('value') );
	$('#multi_pressure_slider').slider({ range: true, min: 0.25, max: 15.0, step: 0.25, values: [ 0.25, 10.0 ], slide: function( event, ui ) { $('#multi_pressure_value_min').val( ui.values[ 0 ] ); $('#multi_pressure_value_max').val( ui.values[ 1 ] ); } });
	$('#multi_pressure_value_min').val( $('#multi_pressure_slider').slider('values', 0) );
	$('#multi_pressure_value_max').val( $('#multi_pressure_slider').slider('values', 1) );
	
	// toggle table content button
	$('.toggle button').click(function() { $(this).parents('table').children('tbody').toggle(); });
	
	// calculate heating value
	var heating_value = HV({ 'reactants': { 'CO': 1, 'O2': 0.5 }, 'products': { 'CO2': 1 } }, 'CO');
	$('#intro .heating_value.molar_basis').text( round( heating_value, 4 ) );
	$('#intro .heating_value.mass_basis').text( round( mol_to_mass( heating_value, 'CO' ), 4 ) );
	
	var $options = $('#options'),
		$data = $('#data');
		
	var $consider_dissociation = $options.find('#consider_dissociation');
	$consider_dissociation.change(function() {
		( $(this).val() == 1 ) ? $(this).val(0) : $(this).val(1);
		$('#consider_dissociation_options').slideToggle();
	});
	
	$('#calc').click(function() {
	
		$data.find('.calc-row').remove();
	
		var phi_type = ( $phi_option_tabs.tabs('option', 'selected') == 0 ) ? 'single' : 'multi';
		var pressure_type = ( $pressure_option_tabs.tabs('option', 'selected') == 0 ) ? 'single' : 'multi';
		var consider_dissociation = ( $consider_dissociation.val() == "1" );
		
		if ( phi_type == 'single' ) {
			var phi = parseFloat( $options.find('#single_phi_value').val() );
		}
		else if ( phi_type == 'multi' ) {
			var phi = {
				'min': parseFloat( $options.find('#multi_phi_value_min').val() ),
				'max': parseFloat( $options.find('#multi_phi_value_max').val() ),
				'step': 0.100
			}
		}
		if ( pressure_type == 'single' ) {
			var pressure = parseFloat( $options.find('#single_pressure_value').val() );
		}
		else if ( pressure_type == 'multi' ) {
			var pressure = {
				'min': parseFloat( $options.find('#multi_pressure_value_min').val() ),
				'max': parseFloat( $options.find('#multi_pressure_value_max').val() ),
				'step': 0.25
			}
		}
		
		var data = [];
		
		if ( !consider_dissociation ) {
			
			if ( phi_type == 'single' ) {
				
				var temp = flameTemp( phi );
				
				$data.children('tbody').append('<tr class="calc-row"><td>-</td><td>' + round(phi,4) + '</td><td class="value">' + round(temp,4) + '</td></tr>');
				
				$('#open_graph').hide();
				
			}
			
			else if ( phi_type == 'multi' ) {
				
				for ( phi.i = phi.min; phi.i <= phi.max; phi.i += phi.step ) {
				
					var temp = flameTemp( phi.i );
					
					$data.children('tbody').append('<tr class="calc-row"><td>-</td><td>' + round(phi.i,2) + '</td><td>' + round(temp,4) + '</td></tr>');
					
					data.push( [ round(phi.i,2), round(temp,4) ] );
					
				}
				
				graph.series[0].setData( data );
				graph.setTitle({ text: "Flame Temperature vs. Fuel Equivalence Ratio" });
				$(graph.xAxis[0].axisTitle.element).text('Fuel Equivalence Ration (phi)');
				
				$('#open_graph').show();
				
			}
			
		}
		
		else {
		
			var allowed_entities = [];
			$options.find('input[name="allowed_entities[]"]:checked').each(function() { allowed_entities.push( $(this).val() ); });
			
			if ( phi_type == 'single' && pressure_type == 'single' ) {
				
				var temp = flameTemp(phi, pressure, true, allowed_entities);
				
				$data.children('tbody').append('<tr class="calc-row"><td>' + round(pressure,2) + '</td><td>' + round(phi,2) + '</td><td>' + round(temp,4) + '</td></tr>');
				
				$('#open_graph').hide();
				
			}
			
			else if ( phi_type == 'multi' && pressure_type == 'single' ) {
				
				for ( phi.i = phi.min; phi.i <= phi.max; phi.i += phi.step ) {
				
					var temp = flameTemp(phi.i, pressure, true, allowed_entities);
					
					$data.children('tbody').append('<tr class="calc-row"><td>' + round(pressure,2) + '</td><td>' + round(phi.i,2) + '</td><td>' + round(temp,4) + '</td></tr>');
					
					data.push( [ round(phi.i,2), round(temp,4) ] );
					
				}
				
				graph.series[0].setData( data );
				graph.setTitle({ text: "Flame Temperature vs. Fuel Equivalence Ratio (P = " + pressure + " atm)" });
				$(graph.xAxis[0].axisTitle.element).text('Fuel Equivalence Ration (phi)');
				
				$('#open_graph').show();
				
			}
			
			else if ( phi_type == 'single' && pressure_type == 'multi' ) {
			
				for ( pressure.i = pressure.min; pressure.i <= pressure.max; pressure.i += pressure.step ) {
				
					var temp = flameTemp(phi, pressure.i, true, allowed_entities);
					
					$data.children('tbody').append('<tr class="calc-row"><td>' + round(pressure.i,2) + '</td><td>' + round(phi,2) + '</td><td>' + round(temp,4) + '</td></tr>');
					
					data.push( [ round(pressure.i,2), round(temp,4) ] );
					
				}
				
				graph.series[0].setData( data );
				graph.setTitle({ text: "Flame Temperature vs. Pressure (phi = " + phi + ")" });
				$(graph.xAxis[0].axisTitle.element).text('Pressure (atm)');
				
				$('#open_graph').show();
			
			}
			
			else if ( phi_type == 'multi' && pressure_type == 'multi' ) {
				
				alert("Can't have ranges for both phi and pressure!");
				
				$('#open_graph').hide();
				
			}
				
		}
	
	});
	
	
	graph = new Highcharts.Chart({
		chart: {
			renderTo: 'flame_temp_graph_container',
			defaultSeriesType: 'line',
		},
		title: {
			text: '-',
			x: -20 //center
		},
		legend: {
			enabled: false
		},
		xAxis: {
			title: {
				enabled: true,
				text: '-',
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