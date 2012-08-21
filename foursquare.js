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

foursquare.refresh = function(coords) {

    // Remove active states
    $('.venue, .mmg').removeClass('active');
    $('.venue, .state-group').removeClass('hidden');
    $('#no-venues, #showall').addClass('hidden');

    var radius = foursquare.settings.radius,
        closest = { dist: radius, id: '', loc: {} };

    // Loop through venues and calculate distance
    _.each(foursquare.venues, function(venue) {
        var center = coords,
            location = { lat: venue.TrainLongitude, lon: venue.TrainLatitude },
            distance = MM.Location.distance(center, location);

        // Hide venues outsite radius,
        if (distance > radius /* 5 miles in meters */) {
            $('[href=#' + venue.id + ']').parent().parent().addClass('hidden');
        } else {
            if (distance < closest.dist) {
                closest = { dist: distance, id: venue.id,  loc: location};
            }
        }
    });

    // Hide labels
    $('.state-group').each(function() {
        if($('.venue', this).not('.hidden').size() === 0)
            $(this).addClass('hidden');
    });

    // Display a 'show all' link
    $('#showall').removeClass('hidden');

    // Show 'no results' message'
    if($('.venue').not('.hidden').size() === 0)
        $('#no-venues').removeClass('hidden');

    // If there are results
    if(closest.id) {
        $('[href=#' + closest.id + ']').parent().parent().addClass('active');
        $('#' + closest.id).addClass('active');

        // Center on point
        MM_map.zoom(14).center(locationOffset(closest.loc));
    } else {
        MM_map.zoom(8).center(locationOffset(coords));
    }
};

// Calculate offset given #content
function locationOffset(location) {
    var offset = MM_map.locationPoint({
            lat: location.lat,
            lon: location.lon
        });
    offset = MM_map.pointLocation({
        x: offset.x - $('#content').width() / 2,
        y: offset.y
    });
    return offset;
}
