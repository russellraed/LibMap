var tsp = null;

var LibMap = function(element){
    this.map = new google.maps.Map(element, {
        center: { lat: -33.950399, lng: 151.198877 },
        zoom: 8
    });
    this.defaultSheet = null;
    /*this.markers = [];
    this.polylines = [];
    this.polygons = [];
    this.directions = [];
    this.directionsService = new google.maps.DirectionsService();
    this.travelMode = google.maps.DirectionsTravelMode.DRIVING;
    */
};

LibMap.prototype.addSheet = function(){
    var sheet = new LibMapSheet(this.map);
    return sheet;
}

LibMap.prototype.getMap = function(){
    return this.map;
}

LibMap.prototype.isValidCoordinates = function(lat, lng){
    if (inrange(-90, lat,90) && inrange(-180, lng, 180) && lat != "" && lng != "") {
        return true;
    }else{
        return false;
    }
}

LibMap.prototype.getBounds = function(){
    return new google.maps.LatLngBounds();
}

LibMap.prototype.getPosition = function(lat, lng){
    return new google.maps.LatLng(lat, lng, true);
}

LibMap.prototype.getTravelMode = function(s){
    if(s == "Driving"){
        return google.maps.DirectionsTravelMode.DRIVING;
    }else if(s == "Walking"){
        return google.maps.DirectionsTravelMode.WALKING
    }else if(s == "Bicycling"){
        return google.maps.DirectionsTravelMode.BICYCLING;
    }else{
        return google.maps.DirectionsTravelMode.DRIVING;
    }
}

LibMap.prototype.setCenter = function(lat, lng){
    this.map.setCenter(new google.maps.LatLng(lat, lng));
}

LibMap.prototype.setZoom = function(zoom){
    this.map.setZoom(zoom);
}

LibMap.prototype.getCurrentLocation = function(callback){
    var initialLocation;

    if(navigator.geolocation) {
        browserSupportFlag = true;
        navigator.geolocation.getCurrentPosition(function(position) {
            initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
            callback(initialLocation);
        }, function() {
            alert("Geolocation service failed.");
            callback(null);
        });
    } else {
        // Browser doesn't support Geolocation
        alert("Your browser doesn't support geolocation. We've placed you in Siberia.");
        this.map.setCenter(initialLocation);
        callback(null);
    }
}

/* 
    ====================================
                LIBMAP SHEET
    ====================================
*/

var LibMapSheet = function(map){
    this.map = map;
    this.markers = [];
    this.polylines = [];
    this.directions = [];
    this.directionsService = new google.maps.DirectionsService();
    this.travelMode = google.maps.DirectionsTravelMode.DRIVING;
    this.setMap(map);
    this.map.defaultSheet = this;
}

LibMapSheet.prototype.setMap = function(map){
    this.map = map;
}

LibMapSheet.prototype.show = function(){
    for(var i=0; i<this.markers.length; i++){
        this.markers[i].setMap(this.map);
    }
}

LibMapSheet.prototype.hide = function(){
    for(var i=0; i<this.markers.length; i++){
        this.markers[i].setMap(null);
    }
}

LibMapSheet.prototype.createMarker = function(lat, lng, title, iconUrl, draggable){
    var marker = {};
    marker.position = new google.maps.LatLng(lat, lng);
    marker.title = title;
    marker.animation = google.maps.Animation.DROP;
    marker.draggable = draggable;
    marker.map = this.map;
    
    if(iconUrl != null){
        marker.icon = new google.maps.MarkerImage(iconUrl);
    }
    
    //marker.label = this.labels[this.labelIndex++ % this.labels.length];

    var gmarker = new google.maps.Marker(marker);
    
    this.markers.push(gmarker);
    return gmarker;
}

LibMapSheet.prototype.createMarkerFromLocation = function(position, title, iconUrl, draggable){
    var marker = {};
    marker.position = new google.maps.LatLng(position.lat(),position.lng());
    marker.title = title;
    marker.animation = google.maps.Animation.DROP;
    marker.draggable = draggable;
    marker.map = this.map;
    if(iconUrl != null){
        marker.icon = new google.maps.MarkerImage(iconUrl);
    }
    var gmarker = new google.maps.Marker(marker);
    this.markers.push(gmarker);
    return gmarker;
}

LibMapSheet.prototype.removeMarker = function(marker){
    marker.setMap(null);
    var newMarkers = [];
    for(var i=0; i<this.markers.length; i++){
        if(marker != this.markers[i]){
            newMarkers.push(this.markers[i]);
        }
    }
    this.markers = newMarkers;
}

LibMapSheet.prototype.removeAllMarkers = function(){
    for(var i=0; i<this.markers.length; i++){
        this.markers[i].setMap(null);
    }
    this.markers = [];
}

LibMapSheet.prototype.addListener = function(component, ev, func){
    google.maps.event.addListener(component, ev, func);
}

LibMapSheet.prototype.addMapClickListener = function(callback){
    google.maps.event.addListener(this.map, "click", function(event) {
        callback(event);
    });
}

LibMapSheet.prototype.getMarkerInfoOnClick = function(marker, callback){
    google.maps.event.addListener(marker, "click", function(event) {
        callback(marker);
    });
}

LibMapSheet.prototype.getMarkerInfoOnDragStart = function(marker, callback){
    google.maps.event.addListener(marker, "dragstart", function(event){
        callback(marker);
    });
}

LibMapSheet.prototype.getMarkerInfoOnDrag = function(marker, callback){
    google.maps.event.addListener(marker, "drag", function(event){
        callback(marker);
    });
}

LibMapSheet.prototype.getMarkerInfoOnDragEnd = function(marker, callback){
    google.maps.event.addListener(marker, "dragend", function(event){
        callback(marker);
        this.map.panTo(marker.getPosition());
    });
}

LibMapSheet.prototype.addMarkerClickListener = function(marker, event, index){
    google.maps.event.addListener(marker, 'click', function(event){
        var infoWindow = new google.maps.InfoWindow({
            content : marker.title
                + "<br/><a href='javascript:self.jobShiftStart(" + index + ");'>" +
                "Start" + "</a> | "
                + "<a href='javascript:self.jobShiftEnd(" + index + ");'>" + 
                "End" + "</a> | " + "<a href='javascript:self.markerRemove("
                + index + ")'>" + "Exclude</a>",
            position : marker.getPosition()
        });
        marker.infoWindow = infoWindow;
        infoWindow.open(this.map);
    });
}

LibMapSheet.prototype.generateDirectionsRenderer = function(dirRes){
    var directionsRenderer = new google.maps.DirectionsRenderer({
        directions : dirRes,
        hideRouteList : true,
        map : this.map,
        panel : null,
        preserveViewport : false,
        suppressInfoWindows : true,
        suppressMarkers : true
    });
    return directionsRenderer;
}

LibMapSheet.prototype.createPolyline = function(path){
    var newPath = [];
    for(var p = 0; p < path.length; p++){
        newPath.push(new google.maps.LatLng(path[p].lat, path[p].lng));
    }

    var newPoly = {
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        path: newPath
    };
    
    var line = new google.maps.Polyline(newPoly);
    line.setMap(this.map);
    this.polylines.push(line);
    return line;
}

LibMapSheet.prototype.removePolyline = function(polyline){
    var newLines = [];
    for(var i=0; i<this.polylines.length; i++){
        if(this.polylines[i] != polyline){
            newLines.push(this.polylines[i]);
        }
    }
    this.polylines = newLines;
    polyline.setMap(null);
}

LibMapSheet.prototype.removeAllPolylines = function(){
    for(var i=0; i<this.polylines.length; i++){
        this.polylines[i].setMap(null);
    }
    this.polylines = [];
}

LibMapSheet.prototype.createPolygon = function(path){
    var newPath = [];
    for(var p = 0; p < path.length; p++){
        newPath.push(new google.maps.LatLng(path[p].lat, path[p].lng));
    }
    var newPoly = {
        title: 'My polygon',
        strokeColor: "#0000FF",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#BBD8E9",
        fillOpacity: 0.4,
        path: newPath,
        events:{
            click:function(polygon, evt){
               alert('This is a polygon');
            },
            mouseout:function(polygon, evt){
              alert('Goodbye polygon!');
            }
        }
    };
    
    var newpolygon = new google.maps.Polygon(newPoly);
    newpolygon.setMap(this.map);
    this.polygons.push(newpolygon);
    return newpolygon;
}

LibMapSheet.prototype.removePolygon = function(polygon){
    var newPolygons = [];
    for(var i=0; i<this.polygons.length; i++){
        if(this.polygons[i] != polygon){
            newPolygons.push(this.polygons[i]);
        }
    }
    this.polygons = newPolygons;
    polygons.setMap(null);
}

LibMapSheet.prototype.removeAllPolygons = function(polygon){
    for(var i=0; i<this.polygons.length; i++){
        this.polygons[i].setMap(null);
    }
    this.polygons = [];
}

LibMapSheet.prototype.getDirections = function(data, callback){
    this.directionsService.route(data, function(response, status){
        callback(response, status);
    });
}

LibMapSheet.prototype.renderDirections = function(response){
    var directionsDisplay = new google.maps.DirectionsRenderer();
    directionsDisplay.setMap(this.map);
    directionsDisplay.setDirections(response);
    this.directions.push(directionsDisplay);
}

LibMapSheet.prototype.removeDirections = function(){
    for(var i=0; i<this.directions.length; i++){
        this.directions[i].setMap(null);
    }
    this.directions = [];
}

LibMapSheet.prototype.setTravelMode = function(travelMode){
    this.travelMode = this.getTravelMode(travelMode);
}

LibMapSheet.prototype.initTSP = function(){
    if(tsp == null){
        //solver
        var directionsPanel = document.getElementById("directions-section");
        tsp = new BpTspSolver(this.map, directionsPanel);
        //change later on
        tsp.setAvoidHighways(true);
        tsp.setTravelMode(this.travelMode);
    }
}

LibMapSheet.prototype.addWaypoint = function(lat, lng){
    this.initTSP();
    tsp.addWaypoint(new google.maps.LatLng( Number(lat), Number(lng) ), function(){
        console.log("waypoint added!");
    }); 
}

LibMapSheet.prototype.addWaypoints = function(){
    this.initTSP();
    tsp.addWaypoint(new google.maps.LatLng( -33.950399, 151.198877 ), function(){
        console.log("waypoint added!");
    }); 
    tsp.addWaypoint(new google.maps.LatLng( -34.950399, 151.198877 ), function(){
        console.log("waypoint added!");
    }); 
}

LibMapSheet.prototype.solveRoundtrip = function(travelMode, callback){
    this.initTSP();
    
    tsp.solveRoundTrip(function(){ 
        var dir = tsp.getGDirections();  // This is a normal GDirections object.
    // The order of the elements in dir now correspond to the optimal route.
        console.log(dir);
        // If you just want the permutation of the location indices that is the best route:
        var order = tsp.getOrder();
        console.log(order);

        // If you want the duration matrix that was used to compute the route:
        var durations = tsp.getDurations();
        console.log(durations);
        callback(dir, order, durations);
    });
}

LibMapSheet.prototype.startOver = function(){
    this.initTSP();
    tsp.startOver();
}



function inrange(min,number,max){
    if( !isNaN(number) && (number >= min) && (number <= max) ){
        return true;
    }else{
        return false;
    };
}