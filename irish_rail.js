var map = L.mapbox.map('map', 'rusty.map-dqtn0sfi',{legendControl: false,shareControl:true, minZoom:10,maxZoom:16})
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
	console.log(features);
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
    
}

function repeatMe() {			
	markerLayer1.setGeoJSON([]); //clear the markers layer	
	$.getJSON(config.apiUrl, {}, function(data) {
		var trains = makeGeoJSON(data['ArrayOfObjTrainPositions']['objTrainPositions']);
		markerLayer1.setGeoJSON({type: 'FeatureCollection', features: features});
		console.log(features);
		markerLayer1.eachLayer(function(layer) {
		    // here you call `bindPopup` with a string of HTML you create - the feature
		    // properties declared above are available under `layer.feature.properties`
		    var content = '<h1>' + layer.feature.properties.title + '<\/h1>' +
		        '<p>' + layer.feature.properties.description.replace(/\n/g, '<br />') + '<\/p>';
				layer.bindPopup(content, { closeButton: true, maxWidth: 200 });
		});
    });
	window.setTimeout(repeatMe, 5000);

}
repeatMe();
//setInterval(repeatMe, 10000);



	


	