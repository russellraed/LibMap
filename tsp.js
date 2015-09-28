/*
  These are the implementation-specific parts of the OptiMap application at
  http://www.gebweb.net/optimap

  This should serve as an example on how to use the more general BpTspSolver.js
  from http://code.google.com/p/google-maps-tsp-solver/

  Author: Geir K. Engdahl
 */

var tsp; // The BpTspSolver object which handles the TSP computation.
var mode;
//var markers = new Array(); // Need pointers to all markers to clean up.
var dirRenderer; // Need pointer to path to clean up.

function initTSP(){
	directionsPanel = document.getElementById("my_textual_div");

	if(!tsp){
		tsp = new BpTspSolver(map.getMap(), directionsPanel);	
	}
	
	tsp.setDirectionUnits("m");

	map.addMapClickListener(function(event){
		tsp.addWaypoint(event.latLng, addWaypointSuccessCallback);
	});

	map.addListener(tsp.getGDirectionsService(), "error", 
		function(){
			alert("Request failed: " + reasons[tsp.getGDirectionsService().getStatus().code]);
		}
	);
}

/*
Removed by russell this is now handled in lib-map.js
function initMap(center, zoom, div) {
	var options = {
		zoom : zoom,
		center : center,
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	map.init(div, options);

	google.maps.event.addListener(map.map, "click", function(event) {
		tsp.addWaypoint(event.latLng, addWaypointSuccessCallback);
	});
}

function loadAtStart(lat, lng, zoom) {
	var center = new google.maps.LatLng(lat, lng);
	initMap(center, zoom, document.getElementById("map"));
	directionsPanel = document.getElementById("my_textual_div");

	tsp = new BpTspSolver(map.getMap(), directionsPanel);
	tsp.setDirectionUnits("m");
	google.maps.event.addListener(tsp.getGDirectionsService(), "error",
		function() {
			alert("Request failed: "
					+ reasons[tsp.getGDirectionsService()
							.getStatus().code]);
		}
	);
}*/

/*
 * Returns a textual representation of time in the format "N days M hrs P min Q
 * sec". Does not include days if 0 days etc. Does not include seconds if time
 * is more than 1 hour.
 */
function formatTime(seconds) {
	var days;
	var hours;
	var minutes;
	days = parseInt(seconds / (24 * 3600));
	seconds -= days * 24 * 3600;
	hours = parseInt(seconds / 3600);
	seconds -= hours * 3600;
	minutes = parseInt(seconds / 60);
	seconds -= minutes * 60;
	var ret = "";
	if (days > 0)
		ret += days + " days ";
	if (days > 0 || hours > 0)
		ret += hours + " hrs ";
	if (days > 0 || hours > 0 || minutes > 0)
		ret += minutes + " min ";
	if (days == 0 && hours == 0)
		ret += seconds + " sec";
	return (ret);
}

/*
 * Returns textual representation of distance in the format "N km M m". Does not
 * include km if less than 1 km. Does not include meters if km >= 10.
 */
function formatLength(meters) {
	var km = parseInt(meters / 1000);
	meters -= km * 1000;
	var ret = "";
	if (km > 0)
		ret += km + " km ";
	if (km < 10)
		ret += meters + " m";
	return (ret);
}

/*
 * Returns textual representation of distance in the format "N.M miles".
 */
function formatLengthMiles(meters) {
	var sMeters = meters * 0.621371192;
	var miles = parseInt(sMeters / 1000);
	var commaMiles = parseInt((sMeters - miles * 1000 + 50) / 100);
	var ret = miles + "." + commaMiles + " miles";
	return (ret);
}

/*
 * Returns two HTML strings representing the driving directions. Icons match the
 * ones shown in the map. Addresses are used as headers where available. First
 * string is suitable for use in reordering the directions. Second string is
 * suitable for printed directions.
 */
function formatDirections(gdir, mode) {
	var addr 	= tsp.getAddresses();
	var labels 	= tsp.getLabels();
	var order 	= tsp.getOrder();
	var retStr 	= "<table class='gebddir' border=0 cell-spacing=0>\n";
	var dragStr = "Drag to re-order stops:<br><ul class='unsortable'>";
	var retArr 	= new Array();
	
	for ( var i = 0; i < gdir.legs.length; ++i) {
		var route = gdir.legs[i];
		//var colour = "g";
		var number = i + 1;
		retStr += "\t<tr class='heading'><td class='heading' width=40>"
				+ "<div class='centered-directions'><img src='"+_config.path+"routing/black" + number
				+ ".png'></div></td>"
				+ "<td class='heading'><div class='centered-directions'>";
		var headerStr;
		if (labels[order[i]] != null && labels[order[i]] != "") {
			headerStr = labels[order[i]];
		} else if (addr[order[i]] != null) {
			headerStr = addr[order[i]];
		} else {
			var prevI = (i == 0) ? gdir.legs.length - 1 : i - 1;
			//var latLng = gdir.legs[prevI].end_location;
			headerStr = gdir.legs[i].start_location.toString();
		}
		dragStr += "<li id='"
				+ i
				+ "' class='ui-state-"
				+ (i ? "default" : "disabled")
				+ "'>"
				+ "<table class='dragTable'><tr><td class='left'><img src='"+_config.path+"routing/black"
				+ number
				+ ".png' /></td><td class='middle'>"
				+ headerStr
				+ "</td><td class='right'>"
				+ (i ? "<button id='dragClose" + i + "' value='" + i
						+ "'></button>" : "") + "</td></tr></table></li>";
		if (i == 0) {
			dragStr += "</ul><ul id='sortable'>";
		}

		retStr += headerStr + "</div></td></tr>\n";
		for ( var j = 0; j < route.steps.length; ++j) {
			var classStr = "odd";
			if (j % 2 == 0)
				classStr = "even";
			retStr += "\t<tr class='text'><td class='" + classStr + "'></td>"
					+ "<td class='" + classStr + "'>"
					+ route.steps[j].instructions + "<div class='left-shift'>"
					+ route.steps[j].distance.text+' ('+route.steps[j].duration.text + ")</div></td></tr>\n";
		}
	}
	dragStr += "</ul><ul class='unsortable'>";
	if (mode == 0) {
		var headerStr;
		if (labels[order[0]] != null && labels[order[0]] != "") {
			headerStr = labels[order[0]];
		} else if (addr[order[0]] != null) {
			headerStr = addr[order[0]];
		} else {
			var prevI = gdir.legs.length - 1;
			var latLng = gdir.legs[prevI].end_location;
			headerStr = latLng.toString();
		}
		dragStr += "<li id='" + 0 + "' class='ui-state-disabled'>"
				+ "<table class='dragTable'><tr><td><img src='"+_config.path+"routing/black" + 1
				+ ".png' /></td><td>" + headerStr + "</td></tr></table></li>";
		retStr += "\t<tr class='heading'><td class='heading'>"
				+ "<div class='centered-directions'><img src='"+_config.path+"routing/black1.png'></div></td>"
				+ "<td class='heading'>" + "<div class='centered-directions'>"
				+ headerStr + "</div></td></tr>\n";
	} else if (mode == 1) {
		var headerStr;
		if (labels[order[gdir.legs.length]] != null
				&& labels[order[gdir.legs.length]] != "") {
			headerStr = labels[order[gdir.legs.length]];
		} else if (addr[order[gdir.legs.length]] == null) {
			var latLng = gdir.legs[gdir.legs.length - 1].end_location;
			headerStr = latLng.toString();
		} else {
			headerStr = addr[order[gdir.legs.length]];
		}
		dragStr += "<li id='" + gdir.legs.length
				+ "' class='ui-state-disabled'>"
				+ "<table class='dragTable'><tr><td><img src='"+_config.path+"routing/black"
				+ (gdir.legs.length + 1) + ".png' /></td><td>" + headerStr
				+ "</td></tr></table></li>";
		retStr += "\t<tr class='heading'><td class='heading'>"
				+ "<div class='centered-directions'><img src='"+_config.path+"routing/black"
				+ (gdir.legs.length + 1) + ".png'></div></td>"
				+ "<td class='heading'>" + "<div class='centered-directions'>"
				+ headerStr + "</div></td></tr>\n";
	}
	dragStr += "</ul>";
	retStr += "</table>";
	retArr[0] = dragStr;
	retArr[1] = retStr;
	return (retArr);
}

function createTomTomLink(gdir) {
	var addr = tsp.getAddresses();
	var labels = tsp.getLabels();
	var order = tsp.getOrder();
	var addr2 = new Array();
	var label2 = new Array();
	for ( var i = 0; i < order.length; ++i) {
		addr2[i] = addr[order[i]];
		if (order[i] < labels.length && labels[order[i]] != null
				&& labels[order[i]] != "")
			label2[i] = labels[order[i]];
	}
	var itn = createTomTomItineraryItn(gdir, addr2, label2);
	var retStr = "<form method='GET' action='tomtom.php' target='tomTomIFrame'>\n";
	retStr += "<input type='hidden' name='itn' value='" + itn + "' />\n";
	retStr += "<input id='tomTomButton' class='calcButton' type='submit' value='Send to TomTom' onClick='jQuery(\"#dialogTomTom\").dialog(\"open\");'/>\n";
	retStr += "</form>\n";
	return retStr;
}

function createGarminLink(gdir) {
	var addr = tsp.getAddresses();
	var labels = tsp.getLabels();
	var order = tsp.getOrder();
	var addr2 = new Array();
	var label2 = new Array();
	for ( var i = 0; i < order.length; ++i) {
		addr2[i] = addr[order[i]];
		if (order[i] < labels.length && labels[order[i]] != null
				&& labels[order[i]] != "")
			label2[i] = labels[order[i]];
	}
	var gpx = createGarminGpx(gdir, addr2, label2);
	var gpxWp = createGarminGpxWaypoints(gdir, addr2, label2);
	var retStr = "<form method='POST' action='garmin.php' target='garminIFrame'>\n";
	retStr += "<input type='hidden' name='gpx' value='" + gpx + "' />\n";
	retStr += "<input type='hidden' name='gpxWp' value='" + gpxWp + "' />\n";
	retStr += "<input id='garminButton' class='calcButton' type='submit' value='Send to Garmin' onClick='jQuery(\"#dialogGarmin\").dialog(\"open\");'/>\n";
	retStr += "</form>\n";
	return retStr;
}

function createGoogleLink(gdir) {
	var addr = tsp.getAddresses();
	var order = tsp.getOrder();
	var ret = "https://maps.google.com/maps?saddr=";
	for ( var i = 0; i < order.length; ++i) {
		if (i == 1) {
			ret += "&daddr=";
		} else if (i >= 2) {
			ret += " to:";
		}
		if (addr[order[i]] != null && addr[order[i]] != "") {
			ret += escape(addr[order[i]]);
		} else {
			if (i == 0) {
				ret += gdir.legs[0].start_location.toString();
			} else {
				ret += gdir.legs[i - 1].end_location.toString();
			}
		}
	}
	return ret;
}

function getWindowHeight() {
	if (typeof (window.innerHeight) == 'number')
		return window.innerHeight;
	if (document.documentElement && document.documentElement.clientHeight)
		return document.documentElement.clientHeight;
	if (document.body && document.body.clientHeight)
		return document.body.clientHeight;
	return 800;
}

function getWindowWidth() {
	if (typeof (window.innerWidth) == 'number')
		return window.innerWidth;
	if (document.documentElement && document.documentElement.clientWidth)
		return document.documentElement.clientWidth;
	if (document.body && document.body.clientWidth)
		return document.body.clientWidth;
	return 1200;
}

function onProgressCallback(tsp) {
	// CURSOR
	jQuery('html').addClass('wait');
	jQuery('#fapiloader').fadeIn();
	jQuery('#fapilogo').fadeOut();
	jQuery('.fr-loading').fadeIn();
}

function setMarkerAsStart(marker) {
	tsp.setAsStart(marker.getPosition());
	drawMarkers(false);
	marker.infoWindow.close();
}

function setMarkerAsStop(marker) {
	tsp.setAsStop(marker.getPosition());
	drawMarkers(false);
	marker.infoWindow.close();
}

function removeMarker(marker) {
	tsp.removeWaypoint(marker.getPosition());
	drawMarkers(false);
	marker.infoWindow.close();
}

function deleteMarker(marker){
	map.removeMarker(marker);
}

/*
Removed by Russell. This is now handled by lib-map.js
function drawMarker(latlng, addr, label, num) {
	console.log("here");
	for ( var i = 0; i < map.markers.length; ++i) {
		if (map.markers[i] != null && map.markers[i].getPosition().equals(latlng)) {
			return;
		}
	}
	var icon = new google.maps.MarkerImage(_config.path+"routing/red" + (num + 1) + ".png");
	
	var marker = components.marker.get(label);
	marker.position = latlng;
	marker.setImage(icon);
	var googleMarker = map.mark(marker);
	
	google.maps.event.addListener(marker, 'click', function(event) {
		var poslabel	=marker.title+'<br/>'+marker.position.lat()+', '+marker.position.lng()+'<br/>';
		var addrStr = (addr == null) ? "" : addr + "<br>";
		var labelStr = (label == null) ? poslabel : poslabel;
		var markerInd = -1;
		for ( var i = 0; i < map.markers.length; ++i) {
			if (map.markers[i] != null
					&& marker.getPosition().equals(map.markers[i].getPosition())) {
				markerInd = i;
				break;
			}
		}
		var infoWindow = new google.maps.InfoWindow({
			content : marker.title
			+ "<br/><a href='javascript:self.jobShiftStart(" + index + ");'>" +
			"Start"	+ "</a> | "
			+ "<a href='javascript:self.jobShiftEnd(" + index + ");'>" + 
			"End" + "</a> | " + "<a href='javascript:self.markerRemove("
			+ index + ")'>" + "Exclude</a>",
			position : marker.getPosition()
		});
		marker.infoWindow = infoWindow;
		infoWindow.open(libmap.map);
	});
	
	return googleMarker;
}*/

function setViewportToCover(waypoints) {
	var bounds = map.getBounds();
	for ( var i = 0; i < waypoints.length; ++i) {
		bounds.extend(waypoints[i]);
	}
	gebMap.fitBounds(bounds);
}


function addWaypointWithLabel(latLng, label) {
	tsp.addWaypointWithLabel(latLng, label, addWaypointSuccessCallbackZoom);
}

function addWaypoint(latLng,label) {
	addWaypointWithLabel(latLng, label, addWaypointSuccessCallbackZoom);
}

function addAddressAndLabel(addr, label) {
	tsp.addAddressWithLabel(addr, label, addAddressSuccessCallbackZoom);
}

function addAddress(addr) {
	addAddressAndLabel(addr, addr);
}

function clickedAddAddress() {
	addAddress(document.address.addressStr.value);
}

function addAddressSuccessCallback(address, latlng) {
	if (latlng) {
		drawMarkers(false);
	} else {
		alert('Failed to geocode: ' + address);
	}
}

function addAddressSuccessCallbackZoom(address, latlng) {
	if (latlng) {
		drawMarkers(true);
	} else {
		alert('Failed to geocode: ' + address);
	}
}

function addWaypointSuccessCallback(latlng) {
	if (latlng) {
		drawMarkers(false);
	}
}

function addWaypointSuccessCallbackZoom(latlng) {
	if (latlng) {
		drawMarkers(true);
	}
}

function drawMarkers(updateViewport) {
	removeOldMarkers();
	var waypoints = tsp.getWaypoints();
	var addresses = tsp.getAddresses();
	var labels = tsp.getLabels();
	for ( var i = 0; i < waypoints.length; ++i) {
		drawMarker(waypoints[i], addresses[i], labels[i], i);
	}
	if (updateViewport) {
		setViewportToCover(waypoints);
	}
}

function startOver() {
	document.getElementById("my_textual_div").innerHTML = "";
	document.getElementById("path").innerHTML = "";
	initMap();
	tsp.startOver(); // doesn't clearOverlays or clear the directionsPanel
	initTSP();
}

function directions(m, walking, bicycling, avoidHighways, avoidTolls) {
	
	startOver();
	
	mode = m;
	tsp.setAvoidHighways(avoidHighways);
	tsp.setAvoidTolls(avoidTolls);
	if (walking)
		tsp.setTravelMode(map.travelMode.WALKING);
	else if (bicycling)
		tsp.setTravelMode(map.travelMode.BICYCLING);
	else
		tsp.setTravelMode(map.travelMode.DRIVING);
	tsp.setOnProgressCallback(onProgressCallback);
	// CURSOR
	jQuery('html').addClass('wait');
	jQuery('#fapiloader').fadeIn();
	jQuery('#fapilogo').fadeOut();
	jQuery('.fr-loading').fadeIn();

	if (m == 0)
		tsp.solveRoundTrip(onSolveCallback);
	else
		tsp.solveAtoZ(onSolveCallback);
}

function getTotalDuration(dir) {
	var sum = 0;
	for ( var i = 0; i < dir.legs.length; i++) {
		sum += dir.legs[i].duration.value;
	}
	return sum;
}

function getTotalDistance(dir) {
	var sum = 0;
	for ( var i = 0; i < dir.legs.length; i++) {
		sum += dir.legs[i].distance.value;
	}
	return sum;
}

function removeOldMarkers() {
	map.removeAllMarkers();
}

function onSolveCallback(myTsp) {
	// CURSOR
	jQuery('html').removeClass('wait');
	jQuery('#fapiloader').fadeOut();
	jQuery('#fapilogo').fadeIn();
	jQuery('.fr-loading').fadeOut();

	var dirRes = tsp.getGDirections();
	var dir = dirRes.routes[0];
	// Print shortest roundtrip data:

	var pathStr = "<p>Trip duration: " + formatTime(getTotalDuration(dir))
			+ "<br>";
	pathStr += "Trip length: " + formatLength(getTotalDistance(dir)) + " ("
			+ formatLengthMiles(getTotalDistance(dir)) + ")</p>";
	document.getElementById("path").innerHTML = pathStr;
	document.getElementById("exportGoogle").innerHTML = "<input id='googleButton' value='View in Google Maps' type='button' class='calcButton' onClick='window.open(\""	+ createGoogleLink(dir) + "\");' />";
	var formattedDirections = formatDirections(dir, mode);
	document.getElementById("my_textual_div").innerHTML = formattedDirections[1];
	
	self.markerRemoveAll();
	// Add nice, numbered icons.
	if (mode == 1) {
		var myPt1 = dir.legs[0].start_location;
		var myIcn1 = _config.path+"routing/black1.png";
		map.createMarker(myPt1.lat(), myPt1.lng(), dir.legs[0].start_address, myIcn1);
	}
	for ( var i = 0; i < dir.legs.length; ++i) {
		var route = dir.legs[i];
		var myPt1 = route.end_location;
		var myIcn1;
		if (i == dir.legs.length - 1 && mode == 0) {
			myIcn1 = _config.path+"routing/black1.png";
		} else {
			myIcn1 = _config.path+"routing/black" + (i + 2) + ".png";
		}

		map.createMarker(myPt1.lat(), myPt1.lng(), route.end_address, myIcn1);
	}
	// Clean up old path.
	if (dirRenderer != null) {
		dirRenderer.setMap(null);
	}
	dirRenderer = map.generateDirectionsRenderer(dirRes);
	self.route(map.markers);
}

function clickedAddList() {
	var val = document.listOfLocations.inputList.value;
	val = val.replace(/\t/g, ' ');
	document.listOfLocations.inputList.value = val;
	addList(val);
}

function addList(listStr) {
	var listArray = listStr.split("\n");
	for ( var i = 0; i < listArray.length; ++i) {
		var listLine = listArray[i];
		if (listLine.match(/\(?\s*\-?\d+\s*,\s*\-?\d+/)
				|| listLine.match(/\(?\s*\-?\d+\s*,\s*\-?\d*\.\d+/)
				|| listLine.match(/\(?\s*\-?\d*\.\d+\s*,\s*\-?\d+/)
				|| listLine.match(/\(?\s*\-?\d*\.\d+\s*,\s*\-?\d*\.\d+/)) {
			// Line looks like lat, lng.
			var cleanStr = listLine.replace(/[^\d.,-]/g, "");
			var latLngArr = cleanStr.split(",");
			if (latLngArr.length == 2) {
				var lat = parseFloat(latLngArr[0]);
				var lng = parseFloat(latLngArr[1]);
				var latLng = map.getPosition(lat, lng);
				tsp.addWaypoint(latLng, addWaypointSuccessCallbackZoom);
			}
		} else if (listLine.match(/\(?\-?\d*\.\d+\s+\-?\d*\.\d+/)) {
			// Line looks like lat lng
			var latLngArr = listline.split(" ");
			if (latLngArr.length == 2) {
				var lat = parseFloat(latLngArr[0]);
				var lng = parseFloat(latLngArr[1]);
				var latLng = map.getPosition(lat, lng);
				tsp.addWaypoint(latLng, addWaypointSuccessCallbackZoom);
			}
		} else if (listLine.match(/\S+/)) {
			// Non-empty line that does not look like lat, lng. Interpret as address.
			tsp.addAddress(listLine, addAddressSuccessCallbackZoom);
		}
	}
}

function reverseRoute() {
	tsp.reverseSolution();
}