function processToGeoJSON(features) {
    var trainFeatures = [];
    for (var i = 0; i < features.length; i++) {
        var t = features[i];
        trainFeatures.push({
            geometry: {
                coordinates: [
                  parseFloat(t.TrainLongitude),
                  parseFloat(t.TrainLatitude)]
            },
            properties: {
                direction: t.Direction,
                title: t.PublicMessage.replace(/\n/g, '<br />'),
                message: t.PublicMessage,
                status: t.TrainStatus,
                'marker-symbol': 'rail',
                'marker-color': '#2D6F83'
            }
        });
    }
    return trainFeatures;
}


 var map = L.mapbox.map('map', 'rusty.map-dqtn0sfi',{legendControl: false,shareControl:true, minZoom:10,maxZoom:16})
    .setView([53.3428,-6.2661], 13);
	L.control.attribution().addAttribution('Information Copyright <a href="http://www.dublinmetro.ie">Dublin Metro</a>').addTo(map);


    var markersLayer = L.mapbox.markerLayer();
    map.addLayer(markersLayer);
    updateTrains();

	

    function updateTrains() {
		var config = {
		    apiUrl: 'http://dtm-api.herokuapp.com/json_it.json?callback=?',
		  };
		$.getJSON(config.apiUrl, {}, function(data) {
          var f = processToGeoJSON(data['ArrayOfObjTrainPositions']['objTrainPositions']);
          markersLayer.setGeoJSON({type: 'FeatureCollection', features: f});
          window.setTimeout(updateTrains, 10000);
      });
    }

