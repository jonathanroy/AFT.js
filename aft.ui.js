$(document).ready(function() {
	
	// Generate UI variables
	$ui = {};
	$('body').find('*').each(function() { $ui[this.id] = $(this); });
	
	// initialize option tabs
	phi_option_tabs = $ui.phi_option_tabs.tabs();
	pressure_option_tabs = $ui.pressure_option_tabs.tabs();
	
	// initialize dialog window
	$ui.graph.dialog({ width: 830, height: 445, autoOpen: false });
	$ui.open_graph.click(function() { $ui.graph.dialog('open'); });
	$ui.open_graph.hide();
	
	// activate option sliders
	$ui.single_phi_slider.slider({ value: 1.0, min: 0, max: 5.0, step: 0.1, slide: function( event, ui ) { $ui.single_phi_value.val( ui.value ); } });
	$ui.single_phi_value.val( $ui.single_phi_slider.slider('value') );
	$ui.multi_phi_slider.slider({ range: true, min: 0, max: 5.0, step: 0.1, values: [ 0.5, 2.0 ], slide: function( event, ui ) { $ui.multi_phi_value_min.val( ui.values[ 0 ] ); $ui.multi_phi_value_max.val( ui.values[ 1 ] ); } });
	$ui.multi_phi_value_min.val( $ui.multi_phi_slider.slider('values', 0) );
	$ui.multi_phi_value_max.val( $ui.multi_phi_slider.slider('values', 1) );
	$ui.single_pressure_slider.slider({ value: 1.0, min: 0.25, max: 10.0, step: 0.25, slide: function( event, ui ) { $ui.single_pressure_value.val( ui.value ); } });
	$ui.single_pressure_value.val( $ui.single_pressure_slider.slider('value') );
	$ui.multi_pressure_slider.slider({ range: true, min: 0.25, max: 15.0, step: 0.25, values: [ 0.25, 10.0 ], slide: function( event, ui ) { $ui.multi_pressure_value_min.val( ui.values[ 0 ] ); $ui.multi_pressure_value_max.val( ui.values[ 1 ] ); } });
	$ui.multi_pressure_value_min.val( $ui.multi_pressure_slider.slider('values', 0) );
	$ui.multi_pressure_value_max.val( $ui.multi_pressure_slider.slider('values', 1) );
	
	$ui.consider_dissociation.change(function() {
		( $(this).val() == 1 ) ? $(this).val(0) : $(this).val(1);
		$ui.consider_dissociation_options.slideToggle();
	});
	
	window.dataset = [];
	
	$ui.calc.click(function() {
	
		window.dataset = [];
	
		$ui.data_table.find('tr.live').remove();
	
		var phi_type = ( phi_option_tabs.tabs('option', 'selected') == 0 ) ? 'single' : 'multi';
		var pressure_type = ( pressure_option_tabs.tabs('option', 'selected') == 0 ) ? 'single' : 'multi';
		var consider_dissociation = ( $ui.consider_dissociation.val() == "1" );
		
		( phi_type == 'multi' || pressure_type == 'multi' ) ? $ui.open_graph.show() : $ui.open_graph.hide();
		
		if ( phi_type == 'single' ) {
			var phi = parseFloat( $ui.single_phi_value.val() );
		}
		else if ( phi_type == 'multi' ) {
			var phi = {
				'min': parseFloat( $ui.multi_phi_value_min.val() ),
				'max': parseFloat( $ui.multi_phi_value_max.val() ),
				'step': 0.100
			}
		}
		if ( pressure_type == 'single' ) {
			var pressure = parseFloat( $ui.single_pressure_value.val() );
		}
		else if ( pressure_type == 'multi' ) {
			var pressure = {
				'min': parseFloat( $ui.multi_pressure_value_min.val() ),
				'max': parseFloat( $ui.multi_pressure_value_max.val() ),
				'step': 0.25
			}
		}
		
		if ( !consider_dissociation ) {
			
			if ( phi_type == 'single' ) {
				var temp = flameTemp( phi );
				var equation = getEquation(phi,2);
				addRow($ui.data_table, ['-', round(phi,2), round(temp,4), displayEquation(equation)]);
			}
			
			else if ( phi_type == 'multi' ) {
				
				for ( phi.i = phi.min; phi.i <= (phi.max + phi.step / 2); phi.i += phi.step ) {
					var temp = flameTemp( phi.i );
					var equation = getEquation(phi.i,2);
					addRow($ui.data_table, ['-', round(phi.i,2), round(temp,4), displayEquation(equation)]);
					window.dataset.push( [ round(phi.i,2), round(temp,4) ] );
				}
				
				graph.series[0].setData( window.dataset );
				graph.setTitle({ text: "Flame Temperature vs. Fuel Equivalence Ratio" });
				$(graph.xAxis[0].axisTitle.element).text('Fuel Equivalence Ration (phi)');
				
			}
			
		}
		
		else {
		
			var allowed_entities = [];
			$ui.options.find('input[name="allowed_entities[]"]:checked').each(function() { allowed_entities.push( $(this).val() ); });
			
			if ( phi_type == 'single' && pressure_type == 'single' ) {
				var temp = flameTemp(phi, pressure, true, allowed_entities);
				var equation = getEquation(phi, 2, temp, pressure, true, allowed_entities);
				addRow($ui.data_table, [round(pressure,2), round(phi,2), round(temp,4), displayEquation(equation)]);
			}
			
			else if ( phi_type == 'multi' && pressure_type == 'single' ) {
				
				for ( phi.i = phi.min; phi.i <= (phi.max + phi.step / 2); phi.i += phi.step ) {
					var temp = flameTemp(phi.i, pressure, true, allowed_entities);
					var equation = getEquation(phi.i, 2, temp, pressure, true, allowed_entities);
					addRow($ui.data_table, [round(pressure,2), round(phi.i,2), round(temp,4), displayEquation(equation)]);
					window.dataset.push( [ round(phi.i,2), round(temp,4) ] );
				}
				
				graph.series[0].setData( window.dataset );
				graph.setTitle({ text: "Flame Temperature vs. Fuel Equivalence Ratio (P = " + pressure + " atm)" });
				$(graph.xAxis[0].axisTitle.element).text('Fuel Equivalence Ration (phi)');
				
			}
			
			else if ( phi_type == 'single' && pressure_type == 'multi' ) {
			
				for ( pressure.i = pressure.min; pressure.i <= (pressure.max + pressure.step / 2); pressure.i += pressure.step ) {
					var temp = flameTemp(phi, pressure.i, true, allowed_entities);
					var equation = getEquation(phi, 2, temp, pressure.i, true, allowed_entities);
					addRow($ui.data_table, [round(pressure.i,2), round(phi,2), round(temp,4), displayEquation(equation)]);
					window.dataset.push( [ round(pressure.i,2), round(temp,4) ] );
				}
				
				graph.series[0].setData( window.dataset );
				graph.setTitle({ text: "Flame Temperature vs. Pressure (phi = " + phi + ")" });
				$(graph.xAxis[0].axisTitle.element).text('Pressure (atm)');
			
			}
			
			else if ( phi_type == 'multi' && pressure_type == 'multi' ) {
				alert("Can't have ranges for both phi and pressure!");
			}
				
		}
	
	});
	
	var addRow = function($table, values) {
		var row = '<tr class="live">';
		$.each(values, function(i,v) { row += '<td>' + v + '</td>'; });
		row += '</tr>';
		$table.find('tr:last').after(row);
	};
	
	var displayEquation = function(equation) {
		var s = '';
		$.each(equation.reactants, function(entity, n) {
			s += n ? round(n,3) + ' ' + entity + ' + ' : '';
		});
		s = s.slice(0,-3) + ' &rarr; ';
		$.each(equation.products, function(entity, n) {
			s += n ? round(n,3) + ' ' + entity + ' + ' : '';
		});
		return s.slice(0,-3);
	};
	
	
	graph = new Highcharts.Chart({
		chart: { renderTo: 'flame_temp_graph_container', defaultSeriesType: 'line' },
		title: { text: '-', x: -20 },
		legend: { enabled: false },
		xAxis: { title: { enabled: true, text: '-', margin: 40 } },
		yAxis: {
			title: { text: 'Flame Temperature [K]', margin: 60 },
			plotLines: [{ value: 0, width: 1, color: '#808080' }]
		},
		tooltip: { formatter: function() { return 'FlameTemp(' + this.x + ') = ' + this.y; } },
		series: [{ data: [] }],
		credits: { enabled: false }
	});
	
});