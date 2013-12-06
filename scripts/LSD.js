define(['jquery'], function($) {

	var LSD = function()
	{
		this.$table = $('#lsd-table');
		this.$results = $('#search-results');
		this._page = 1;
		this._nbRowsPerScroll = 3; // Ajout des rows 3 par 3
		this._resultsList = [];
		this._isPlaying = false;
	}

	LSD.prototype.constructor = LSD.Deezer;

	/**
	 * callAPI( params )
	 * @params : an object : { string "query" [, function "callback"] }
	**/

	LSD.prototype.callAPI = function (params)
	{
		// Building new list, so let's reset the old entries
		this._resultsList = [];
		this._page = 1;

		var req = $.ajax({
			dataType : 'jsonp',
			type : 'GET',
			url : 'http://api.deezer.com/search/track/',
			//context : this,
			data : {
				output : 'jsonp',
				//jsonp : 'callback',
				q : params.query,
				order : 'RATING'
			}
		});

		req.done(function(res) {
			if ('function' === typeof params.callback)
				params.callback( res );
		});

	};

	/**
	 * buildList( response[, callback] )
	 * @response : an object of Deezer JSON results
	 * @callback : a function to call when the results have been added to the DOM
	**/

	LSD.prototype.buildList = function( response, callback )
	{
		// Getting ALL results of the query within a single Array, then, we'll load the results 30 by 30 when scrolling (this will save Ajax requests)
		if (this._resultsList.length === 0)
		{
			var element, row;
			for (var i = 0, c = response.data.length; i < c; ++i)
			{
				element = response.data[i];

				if ('object' !== typeof element)
					continue;

				row = 	'<tr>' +
							'<td><div class="btn-group btn-group-xs"><button data-preview="'+ element.preview +'" class="btn btn-primary"><i class="glyphicon glyphicon-play"></i></button></div></td>' +
							'<td>' + element.title + '</td>' +
							'<td>' + element.album.title + '</td>' +
							'<td>' + element.artist.name + '</td>' +
						'</tr>';

				this._resultsList.push( row );
			}
		}

		while ($(document).height() === $(window).height()) {
			this.addResultsToList( callback || null );
		}

	};

	/**
	 * addResultsToList([ callback ])
	 * @callback : a function to call when the results have been added to the DOM
	**/

	LSD.prototype.addResultsToList = function( callback )
	{

		if (this._resultsList.length === 0)
			return false;

		var rows = '';
		for (var i = (this._page - 1) * this._nbRowsPerScroll; i < this._nbRowsPerScroll * this._page; ++i)
		{
			if (undefined === this._resultsList[i])
				break;

			rows += this._resultsList[i] + "\n";
		}

		this.$results.append( rows );

		var that = this;

		$('[data-preview]').each( function() {
			// Removing all possible previous event listeners (saving memory)
			$(this).off('click', that.onClicPlay);
			// Setting new event listeners in relationship with the new results list
			$(this).on('click', that.onClicPlay);
		} );

		this._page++;

		if ('function' === typeof callback)
			callback();

	};

	/**
	 * onClicPlay()
	 * --
	 * Toggle behavior when clicking on a button "play/stop"
	**/

	LSD.prototype.onClicPlay = function()
	{

		var $button = $(this).find('.glyphicon');
		this._isPlaying = !! $button.hasClass('glyphicon-stop');

		var audio = $('#preview').get(0);
		if (this._isPlaying) {
			// _playerState = 'stop';
			this._isPlaying = false;
			audio.pause();
			$button.removeClass('glyphicon-stop').addClass('glyphicon-play');
		} else {
			$('#preview').attr({
				'src' : $(this).data('preview'),
				'autoplay' : true
			});
			this._isPlaying = true;
			audio.play();
			$('.glyphicon').removeClass('glyphicon-stop').addClass('glyphicon-play');
			$button.removeClass('glyphicon-play').addClass('glyphicon-stop');
		}

	};

	return new LSD;

});