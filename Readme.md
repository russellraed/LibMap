LibMap
=======

Getting started
---------------

You must include lib-map.js, google maps js, tsp.js and solver.js on your html.

``` html
<script type="text/javascript" src="js/tsp.js" ></script>
<script type="text/javascript" src="js/solver.js" ></script>
<script type="text/javascript" src="js/lib-map.js" ></script>
<script type="text/javascript" src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDs-yHEIicm_0EdS7tPpBS65f090YRtg2U"></script>
<script type="text/javascript" src="https://www.google.com/jsapi"></script>
```

The library can now be instantiated by the LibMap(element) constructor.

``` javascript
var map = new LibMap(document.getElementById("map"));
```

Setting center of map.

``` javascript
map.setCenter(lat, lng);
```

Setting zoom.

``` javascript
map.setZoom(n);
```

Getting map bounds.

``` javascript
map.getBounds();
```

Get a map lat-lng position object based from latitude and longitude.

``` javascript
var position = map.getPosition(lat, lng);
```

Check if coordinates are valid.

``` javascript
var isValid = map.isValidCoordinates(lat, lng);
```

Get travel mode - returns a google travel mode object. Possible parameter values are "Driving", "Walking" and "Bicycling".

``` javascript
var travelMode = map.getTravelMode("Driving");
```

Set travel mode - sets the current travel mode.Possible parameters are same as above.

``` javascript
map.setTravel mode("Walking");
```

Markers
-------

Creating a marker and displaying it in the map
	
	Syntax: 
		var marker = map.createMarker(lat, lng, title, iconUrl);
	Returns: 
		The google marker object that was created.
	Sample usage:
		var marker = map.createMarker(-33.344, 102.434, "My Marker", "/img/1.png");

Remove a marker from the map
	
	Syntax:
		map.removeMarker(marker);

Remove all markers from the map

	Syntax:
		map.removeAllMarkers();

Add a marker click listener

	Syntax:
		map.addMarkerClickListener(marker, callback);
	Sample Usage:
		var marker = map.createMarker(-33.344, 102.434, "My Marker", "/img/1.png");
		map.addMarkerClickListener(marker, function(){
			alert("marker was clicked!");
});


Polylines

Create a polyline
Syntax: 
		var polyline= map.createPolyline(path);
	Returns: 
		The google polyline object that was created.
	Parameters:
		path - an array of property objects containing lat and lng values.
	Sample usage:
		var path = [
			{ lat: 123, lng: 12.1 },
			{ lat: 12.3, lng: 80.13 },
			{ lat: 1.23, lng: 33.12 },
		];
		var polyline = map.createPolyline(path);

Remove a polyline
Syntax: 
map.removePolyline(polyline);

Remove all polylines
Syntax: 
map.removeAllPolylines();

Polygons

Create a polygon
Syntax: 
		var polygon = map.createPolygon(path);
	Returns: 
		The google polygon object that was created.
	Parameters:
		path - an array of property objects containing lat and lng values.
	Sample usage:
		var path = [
			{ lat: 123, lng: 12.1 },
			{ lat: 12.3, lng: 80.13 },
			{ lat: 1.23, lng: 33.12 },
		];
		var polygon= map.createPolygon(path);

Remove a polygon
Syntax: 
map.removePolygons(polygon);

Remove all polygons
Syntax: 
map.removeAllPolygons();

Directions
Getting directions

Syntax:
	map.getDirections(data, callback(response, status) );
Parameters:
	data - property object that contains the following:
		origin (required) - Origin of your route. This can be text address or for more accurate result, use google latlng object. use map.getPosition(lat, lng)
		destination (required) - Destination of your route. Same format as origin.
		waypoints (optional) - array of "stop-overs". Same format as origin and destination.
		travel mode (required)- This can be driving, walking, or bycicling google data types. See number 2.
		avoidHighways (optional) - boolean
		avoidTolls (optional) - boolean

Sample usage:
	var origin = map.getPosition(1.1341, 2.43);
var destination = map.getPosition(13.134, 34.54);
	var travelMode = map.getTravelMode("Driving");

var waypoint1 = map.getPosition(13.134, -34.54);
var waypoint2 = map.getPosition(-43.134, -34.54);

var data = {
	 	origin: origin,
		destination: destination,
	 	waypoints: [ wapoint1, waypoint2 ],
	 	travelMode: travelMode,
	 	optimizeWaypoints: true,
	 	avoidHighways: false,
  		avoidTolls: true
	}
	map.getDirections(data, function(response, status){
if (status == google.maps.DirectionsStatus.OK) {
			//do something with the response
}else{
			//show no results
}
});
		
Rendering Directions
Syntax:
	map.renderDirections(response);
Parameters:
	response - a google get directions response object
Sample Usage:
	map.getDirections(data, function(response, status){
if (status == google.maps.DirectionsStatus.OK) {
		map.renderDirections(response);
}else{
		//show no results
}
});
	
Remove directions in the map
Syntax:
	map.removeDirections();

Solver

Initializing the solver
	Syntax:
		map.initTSP();
Adding waypoints
	Syntax:
		map.addWaypoint(lat, lng);
Solving the roundtrip:
Syntax:
	map.solveRoundtrip( travelMode, callback(directions, order, duration) );
Sample Usage:
map.addWaypoint(123, 123);
map.addWaypoint(124, 124);
map.solveRoundtrip(travelMode, function(directions, order, duration){
		map.renderDirections(directions);
		//do something else with order 
		//do something else with duration
	});

Starting over
Syntax:
	map.startOver();
