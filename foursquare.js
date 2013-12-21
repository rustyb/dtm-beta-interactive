var foursquare = {};


// Array for venues queue
foursquare.venues = [];


// Get venues
foursquare.start = _.throttle(function(){
    // Default ajax params
    foursquare.getVenues();
}, 20000);


// Fetch venues from foursquare
foursquare.getVenues = function() {
    reqwest({
        url: 'http://dtm-api.herokuapp.com/json_it.json?callback=?',
        type: 'jsonp',
        jsonCallback: 'callback',
		contentType: "application/json",
		accepts: "application/json",
        success: function(d) {
            foursquare.processVenues(d);
        }
    });
};


// Extract relevant data from venues
foursquare.processVenues = function(d) {
    _.each(d.ArrayOfObjTrainPositions.objTrainPositions, function(item, index) {
        if (item.TrainLatitude && item.TrainLongitude) {
            foursquare.venues.push(item);
        }
    });
    
    foursquare.map();
};
	
	
	// Map the venues
	foursquare.map = function() {
	    var points = { 'type': 'FeatureCollection',
	        'features': []
	    };

	    _.each(_.rest(foursquare.venues, foursquare.last || 0), function(venue) {
	        points.features.push({
	       		type: 'Feature',
	            id: venue.TrainCode,
	            geometry: {
	                type: 'Point',
	                coordinates: [venue.TrainLongitude, venue.TrainLatitude]
	            },
	            properties: {
	                name: venue.TrainCode,
	                message: venue.PublicMessage.replace(/\n/g, '<br />'),
					status: venue.TrainStatus,
					train_date: venue.TrainDate,
					direction: venue.Direction
	            }
	
	        });
	    });
	
	

	foursquare.last = foursquare.venues.length;
	    if (MM_map.venueLayer) {
	        MM_map.venueLayer.geojson(points);
	    } else {
	        MM_map.venueLayer = mmg().factory(function(x) {
	            var d = document.createElement('div'),
	                overlay = document.createElement('div'),
	                anchor = document.createElement('div');

	            var template = _.template(
	                '<div class="location">' +
	                    '<span class="name fn"><%= name %></span>' +
	                    '<span class="adr">' +
	                        '<span class="address street-address"><%= message %></span>' +
	                    '</span>' +
	                '</div>' +
	                '<div class="foursquare">' +
	                '</div>'
	            );
	            overlay.className = 'overlay';
	            overlay.innerHTML = template(x.properties);

	            anchor.className = 'anchor';
	            anchor.appendChild(overlay);

	            d.id = x.id;
	            d.className = 'mmg vcard';
	            d.appendChild(anchor);

	            return d;
	        }).geojson(points);
	        MM_map.addLayer(MM_map.venueLayer);
	    }
	    MM_map.setCenter({
	        lat: MM_map.getCenter().lat,
	        lon: MM_map.getCenter().lon
	    });
	
    
    // Handlers
    $('.mmg').click(function(e) {
        e.preventDefault();
        $('[href=#' + $(this).attr('id') + ']').click();
    });
    $('#showall').click(function(e) {
        e.preventDefault();
        $('.venue, .state-group').removeClass('hidden');
        $('.venue, .mmg').removeClass('active');
        $(this).addClass('hidden');
        $('#no-venues').addClass('hidden');
        $('input[type=text]', '#search form').val('').focus();
    });
	foursquare.start();
};

