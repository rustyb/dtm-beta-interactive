var map = L.mapbox.map('map', 'rusty.map-dqtn0sfi',{legendControl: false,shareControl:true, minZoom:10,maxZoom:16})
    .setView([53.3428,-6.2661], 13);

var config = {
    apiUrl: 'http://dtm-api.herokuapp.com/json_it.json?callback=?',
  };


//<![CDATA[
var markerLayer1 = L.mapbox.markerLayer();
var features = [];

function makeGeoJSON(trains) {
      /* Place marker for each train. */
      for (var i = 0; i < trains.length; i++) {
        /* Get marker's location */
        var latLng = new L.LatLng(
          trains[i]['TrainLatitude'],
          trains[i]['TrainLongitude']
        );

		features.push({
		            type: 'Feature',
		            geometry: {
		                type: 'Point',
		                coordinates: [trains[i]['TrainLongitude'],trains[i]['TrainLatitude']]
		            },
		            properties: {
		                'marker-color': '#000',
		                'marker-symbol': 'rail',
		                title: trains[i]['TrainCode'],
						description: trains[i]['PublicMessage'].replace(/\n/g, '<br />')
		            }
		        });

	}
	return features;
}

function repeatMe() {
	markerLayer1.setGeoJSON([]); //clear the markers layer
	
	$.getJSON(config.apiUrl, {}, function(data) {
		console.log(data);
		var trains = makeGeoJSON(data['ArrayOfObjTrainPositions']['objTrainPositions']);
        markerLayer1.setGeoJSON({type: 'FeatureCollection', features: features});
		
    });
		
	markerLayer1.addTo(map);
		markerLayer1.eachLayer(function(layer) {
		    // here you call `bindPopup` with a string of HTML you create - the feature
		    // properties declared above are available under `layer.feature.properties`
		    var content = '<h1>' + layer.feature.properties.title + '<\/h1>' +
		        '<p>' + layer.feature.properties.description + '<\/p>';
				layer.bindPopup(content, { closeButton: true, maxWidth: 200 });
		});

}
repeatMe();
setInterval(repeatMe, 5000);


	


	