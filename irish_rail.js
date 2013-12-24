var map = L.mapbox.map('map', 'ebow.map-hsqi45u0,rusty.gkm9pb8i',{legendControl: false,shareControl:true, minZoom:10,maxZoom:16})
    .setView([53.3428,-6.2661], 13);

var config = {
    apiUrl: 'http://dtm-api.herokuapp.com/json_it.json?callback=?',
  };


//<![CDATA[
var markerLayer1 = L.mapbox.markerLayer();
markerLayer1.addTo(map);
var features = [];
		

function makeGeoJSON(trains) {
	features.length = 0;
      /* Place marker for each train. */
      for (var i = 0; i < trains.length; i++) {
        /* Get marker's location */
        var latLng = new L.LatLng(
          trains[i]['TrainLatitude'],
          trains[i]['TrainLongitude']
        );
 train_title = trains[i]['PublicMessage'].split('\\n')[1];
train_status = train_title.split('(')[1];
 train_dis = trains[i]['PublicMessage'].replace(/\\n/g, '<br />'); 
		features.push({
		            type: 'Feature',
		            geometry: {
		                type: 'Point',
		                coordinates: [trains[i]['TrainLongitude'],trains[i]['TrainLatitude']]
		            },
		            properties: {
		                'marker-color': '#00a7e7',
		                'marker-symbol': 'rail',
		                title: trains[i]['TrainCode'],
						description:  train_dis,
						train_name: train_title
		            }
		        });

	}
    
}

function repeatMe() {			
	$.getJSON(config.apiUrl, {}, function(data) {
		var trains = makeGeoJSON(data['ArrayOfObjTrainPositions']['objTrainPositions']);
		markerLayer1.setGeoJSON({type: 'FeatureCollection', features: features});
		console.log(features);		
/*	markerLayer1.eachLayer(function(layer) {
		    // here you call `bindPopup` with a string of HTML you create - the feature
		    // properties declared above are available under `layer.feature.properties`
		    var content = '<h1>' + layer.feature.properties.title + '<\/h1>' +
		        '<p>' + layer.feature.properties.description.replace(/\\n/g, '<br />') + '<\/p>';
				layer.bindPopup(content, { closeButton: true, maxWidth: 200 });
		});*/
		$("#onscreen").empty();
		markerLayer1.eachLayer(function(e) {
		   // var marker = e.layer,
		        feature = e.feature;

		    /// Create custom popup content
		    var content = '<p><b>' + feature.properties.train_name + '<\/b>' +
		        '<br /><em>' + feature.properties.description.split('<br />')[2] + '<\/em<\/p>';

		    // http://leafletjs.com/reference.html#popup
		    e.bindPopup(content,{closeButton: true, maxWidth: 200});
			
			// construct an empty list to fill with onscreen markers
			var inBounds = [];
			inBounds.length = 0;			
		// for each marker we want it to fill the list
		    inBounds.push(e);
			//build list items from markers array
			var index; 
			for (index = 0; index < inBounds.length; ++index) {
				$('<div id="open-popup" class="item"><div class="title"><img src="img/stop.png" style="width:24px;"/></div>' +
				                    '<div class="info"><b>'+ inBounds[index].feature.properties.train_name + '</b><br />' + inBounds[index].feature.properties.description.split('<br />')[2] +'</div></div>') 
					.prependTo($("div#onscreen"))
					.click((function(marker) {
						return function() {
							map.panTo(marker.getLatLng());
							marker.openPopup();
						};
					})(inBounds[index]));
			}			
		});		
    });
	window.setTimeout(repeatMe, 10000);
}
repeatMe();
//setInterval(repeatMe, 10000);



	


	