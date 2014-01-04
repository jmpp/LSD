requirejs.config({
	paths : {
		'jquery' : '../lib/jquery/jquery-2.0.3.min',
		'jq-tablesorter' : '../lib/jquery/tablesorter/jquery.tablesorter',
		'jq-tablesorterwidgets' : '../lib/jquery/tablesorter/jquery.tablesorter.widgets',
		'bootstrap' : '../lib/bootstrap/dist/js/bootstrap.min'
	},
	shim : {
		'bootstrap' : {
			'deps' : ['jquery']
		},
		'jq-tablesorter' : {
			'deps' : ['jquery']
		},
		'jq-tablesorterwidgets' : {
			'deps' : ['jq-tablesorter']
		},
		'LSD' : {
			'deps' : ['bootstrap', 'jq-tablesorterwidgets']
		}
	}
});

require(['jquery', 'LSD'], function($, LSD) {

	// Implement 'tablesorter' plugin
	$('#lsd-table').tablesorter({
		widgets: ["resizable"]
	});
	// Useful for update the tablesorter plugin list when new results arrives in the table
	var resetTableSorter = function() {
		// let the plugin know that we made a update 
		$('#lsd-table').trigger("update");
		// sort on the first column 
		$('#lsd-table').trigger("sorton",[[[0,0],[0,0]]]); 
	}

	// Function to process to launch a research
	var launchSearch = function() {
		if ($('#q').val() === '')
			return false;

		// Display loader
		$('.loader').show();

		// Call me maybe !
		LSD.callAPI({
			query : $('#q').val(),
			callback : function( response ) {

				// Hide loader
				$('.loader').hide();

				LSD.buildList( response, resetTableSorter );
			}
		});

		// Reset results list ...
		$('#search-results').html('');
	};

	var _keyDownTimer = 0;
	var _searchDelay = 1000;

	// At keydown, let's call the Deezer API
	$('#q').on('keydown', function(evt) {
		clearTimeout( _keyDownTimer );
		_keyDownTimer = setTimeout(launchSearch, _searchDelay);
	});

	// ... or call it immediately if the user presses 'Enter'
	$('#search').on('submit', function(evt) {
		evt.preventDefault();
		clearTimeout( _keyDownTimer );
		launchSearch();
	});

	// Scrolling will load the next results
	$(window).scroll(function() {
		if ($(window).scrollTop() + $(window).height() < $(document).height())
			return false;

		// When scrolling, if we reached page bottom, let's call the next results !
		LSD.addResultsToList( resetTableSorter );
	});

});