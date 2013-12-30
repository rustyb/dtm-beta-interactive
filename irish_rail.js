var map = L.map('map',{legendControl: false,shareControl:false, minZoom:10,maxZoom:16})
    .setView([53.3428,-6.2661], 12);
L.mapbox.tileLayer('rusty.gm7f9bc4').addTo(map)

// create layer selector
      function createSelector(layer) {
        var sql = new cartodb.SQL({ user: 'rustyb' });		    

        var $options = $('#layer_selector li');
        $options.click(function(e) {
          // get the area of the selected layer
          var $li = $(e.target);
          var area = $li.attr('data');

          // deselect all and select the clicked one
          $options.removeClass('selected');
          $li.addClass('selected');

          // create query based on data from the layer
          var query = "	SELECT * FROM " +
			    " stops_frequent_copy_1";

          if(area !== 'all') {
            //query = "select * from stops where stop_id = '8220DB000006'";
			query = "SELECT  * FROM " +
				    " stops_frequent_copy_1" +
			" WHERE stops_frequent_copy_1.trip_id = '"+ area + "'" +
			" ORDER BY" +
			    " stops_frequent_copy_1.stop_sequence ASC";
          }

          // change the query in the layer to update the map
          layer.setQuery(query);
		  layer.setCartoCSS("#stops_frequent_copy_1{#stops_frequent_copy_1[trip_id='4572.95.0-4-b12-1.8.I'] {marker-fill:#F47B20;} #stops_frequent_copy_1[trip_id='5965.1818.0-7-b12-1.13.I'] {marker-fill:#231F20;}#stops_frequent_copy_1[trip_id='3686.156.0-9-b12-1.29.I'] {marker-fill:#00B1B0;} #stops_frequent_copy_1[trip_id='3277.357.0-13-b12-1.132.I'] {marker-fill:#00A14B;} #stops_frequent_copy_1[trip_id='5044.2038.0-15-b12-1.148.I'] {marker-fill:#A97C50;} #stops_frequent_copy_1[trip_id='4775.2239.0-16-b12-1.162.I'] {marker-fill:#8DC63F;} #stops_frequent_copy_1[trip_id='4166.2434.0-27-b12-1.193.I'] {marker-fill:#3C2415;} #stops_frequent_copy_1[trip_id='287.1567.0-27B-b12-1.442.I'] {marker-fill:#7F3F98;} #stops_frequent_copy_1[trip_id='3241.2972.0-39A-b12-1.246.I'] {marker-fill:#2E3192;}#stops_frequent_copy_1[trip_id='5431.3044.0-40-b12-1.252.I'] {marker-fill:#00AEEF;} #stops_frequent_copy_1[trip_id='6511.3458.0-46A-b12-1.301.I'] {marker-fill:#7F3F98;} #stops_frequent_copy_1[trip_id='5603.4178.0-83-b12-1.48.I'] {marker-fill:#0063A6;} #stops_frequent_copy_1[trip_id='4283.1126.0-123-b12-1.375.I'] {marker-fill:#414042;} #stops_frequent_copy_1[trip_id='6289.4418.0-145-b12-1.397.I'] {marker-fill:#F26522;} #stops_frequent_copy_1[trip_id='6127.1318.0-150-b12-1.405.I'] {marker-fill:#F47B20;} #stops_frequent_copy_1[stop_sequence='1']{marker-fill:#FFF; marker-width:12; marker-line-width:4;marker-line-color: #3C2415;}marker-width:8.5; marker-line-width:1.5; marker-fill: #7F3F98; marker-line-color: #FFF;marker-line-opacity: 1;}");		
        });
      }

cartodb.createLayer(map, 'http://rustyb.cartodb.com/api/v2/viz/93e6dabc-7101-11e3-aa75-39e8678d6411/viz.json')
        .addTo(map)
		.on('done', function(layer) {
	     createSelector(layer);
          layer.getSubLayer(0).infowindow.set('template', $('#infowindow_template').html());
		  
          layer.setInteraction(true);
		
          layer.on('featureOver', function(e, pos, latlng, data) {
          });

          layer.on('error', function(err) {
            cartodb.log.log('error: ' + err);
          });
        }).on('error', function() {
          cartodb.log.log("some error occurred");
        });
        
			         

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



	


	