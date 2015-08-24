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

LibMap
------

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

Sheets
------

A map can have multiple sheets. Sheets contains gmap components that can be rendered by the map.

Creating a sheet.

``` javascript
var sheet = map.addSheet();
```

### Markers

Creating a marker and displaying it in the map. This returns the google marker object that was created.

``` javascript
var marker = sheet.createMarker(lat, lng, title, iconUrl);
//Sample usage:
var marker = sheet.createMarker(-33.344, 102.434, "My Marker", "/img/1.png");
```

Remove a marker from the sheet.
``` javascript
sheet.removeMarker(marker);
```

Remove all markers from the map.
``` javascript
sheet.removeAllMarkers();
```

Add a marker click listener.
``` javascript
sheet.addMarkerClickListener(marker, callback);
//Sample Usage:
var marker = sheet.createMarker(-33.344, 102.434, "My Marker", "/img/1.png");
sheet.addMarkerClickListener(marker, function(){
	alert("marker was clicked!");
});
```

### Polylines

Create a polyline by passing an array property object containing lat ang lng values. This returns the google polyline object that was created.
``` javascript
var polyline= map.createPolyline(path);
//Sample usage:
var path = [
	{ lat: 123, lng: 12.1 },
	{ lat: 12.3, lng: 80.13 },
	{ lat: 1.23, lng: 33.12 },
];
var polyline = sheet.createPolyline(path);
```

Remove a polyline

``` javascript
sheet.removePolyline(polyline);
```

Remove all polylines
``` javascript
sheeet.removeAllPolylines();
```

### Polygons

Create a polygon by passing an array property object containing lat ang lng values. This returns the google polygon object that was created.
``` javascript
var polygon = sheet.createPolygon(path);
	
//Sample usage:
var path = [
	{ lat: 123, lng: 12.1 },
	{ lat: 12.3, lng: 80.13 },
	{ lat: 1.23, lng: 33.12 },
];
var polygon= sheet.createPolygon(path);
```

Remove a polygon
``` javascript
sheet.removePolygons(polygon);
```

Remove all polygons
``` javascript
sheet.removeAllPolygons();
```

### Directions

Getting directions
``` javascript
map.getDirections(data, callback(response, status) );
```	

``` javascript
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
	sheet.getDirections(data, function(response, status){
	if (status == google.maps.DirectionsStatus.OK) {
		//do something with the response
	}else{
		//show no results
	}
});
```

#### data
property object that contains the following:

- origin (required)
	Origin of your route. This can be text address or for more accurate result, use google latlng object. use map.getPosition(lat, lng)
- destination (required)
	Destination of your route. Same format as origin.
- waypoints (optional)
	array of "stop-overs". Same format as origin and destination.
- travel mode (required)
	This can be driving, walking, or bycicling google data types. See number 2.
- avoidHighways (optional)
	boolean
- avoidTolls (optional)
	boolean
		

Rendering Directions

``` javascript
map.renderDirections(response);
```
#### response
a google get directions response object

```javascript
sheet.getDirections(data, function(response, status){
	if (status == google.maps.DirectionsStatus.OK) {
		map.renderDirections(response);
	}else{
		//show no results
	}
});
```
	
Remove directions in the map

``` javascript
sheet.removeDirections();
```

Solver
------

Initializing the solver

``` javascript
sheet.initTSP();
```

Adding waypoints
``` javascript
sheet.addWaypoint(lat, lng);
```

Solving roundtrip
``` javascript
sheet.solveRoundtrip( travelMode, callback(directions, order, duration) );
//Sample Usage:
sheet.addWaypoint(123, 123);
sheet.addWaypoint(124, 124);
sheet.solveRoundtrip(travelMode, function(directions, order, duration){
	sheet.renderDirections(directions);
	//do something else with order 
	//do something else with duration
});
```

Starting over
``` javascript
map.startOver();
```