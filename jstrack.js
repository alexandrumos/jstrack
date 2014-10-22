//  jstrack 0.1
//  developed by Alexandru Moș - http://alexandrumos.com
//  may be freely distributed under the MIT license
//  http://github.com/jstrack

function jstrack(param) {

    // default settings for the map editor
    var settings = {
        width: 500,                     // map's div default width (px)
        height: 500,                    // map's div default height (px)
        color: '#ff0000',               // line color
        zoom: 10,                       // initial map zoom
        center: {                       // this center (lat, lng) will be used for map initial center if a path is not specified
            lat: 0.0,
            lng: 0.0
        },
        snapToRoad: false,              // when set on true the new track points will follow roads
        snapToRoadMode: 'driving',      // default snap to road mode (driving, bicycling or walking)
        panControl: false,              // when set on true will show the pan control into the map window
        streetViewControl: false,       // when set on true will show the StreetView control into the map window
        points: [],                     // initial track points can be added trough this array
        editable: true                  // when set on true the track is editable, on false only displays the line (NOT USED FOR NOW)
    };

    // snap to road mode types (as defined by Google Maps JS API)
    var snapToRoadTypes = {
        driving: google.maps.DirectionsTravelMode.DRIVING,
        bicycling: google.maps.DirectionsTravelMode.BICYCLING,
        walking: google.maps.DirectionsTravelMode.WALKING
    }

    // reference to the map element
    var mapElem = null;

    // actual map instance
    var gmap = null;

    // reference to the editable poly line (track)
    var polyLine = null;

    // an array containing all the track's points
    var path = new google.maps.MVCArray;

    // directions service instance, required for snap to road feature
    var dservice = new google.maps.DirectionsService();

    // this is set on true when route points are added in order to ignore the path changed event
    var routeAddMode = false;

    // there's set a general key handler and both Alt and Shift keys are signaled when are pressed
    // (used by the multi-point delete when a point was double clicked)
    var isAltPressed = false;   // when on true, all the points before the double clicked one are deleted
    var isShiftPressed = false; // when on true, all the points after the double clicked one are deleted

    // reference to this object, needed to call object methods from inside functions (TODO: reformat explanation)
    var jstrack = null;

    // keeps the handler for the function which is called every time when the path points are changed
    // (add, modify, delete points)
    var pathChangeHandler = null;

    // when the editor is instantiated with an object as parameter, the default attributes are overwritten with
    // the ones from this object
    if (typeof param === 'object') {
        for (i in param) {
            settings[i] = param[i];
        }
    }

    // editor is instantiated only with the map element ID (any other editor params are the default ones)
    if (typeof param === 'string') {
        settings.mapId = param;
    }

    // method: the map's center will be changed to the indicated location
    this.setCenter = function(lat, lng) {
        gmap.panTo(new google.maps.LatLng(lat, lng));
    }

    // method: replaces existing path points
    this.setPathPoints = function(points) {
        routeAddMode = true;

        path.clear();

        var bounds = new google.maps.LatLngBounds();
        for (i in points) {
            var point = new google.maps.LatLng(points[i].lat, points[i].lng);
            path.push(point);
            bounds.extend(point);

            gmap.fitBounds(bounds);
        }

        routeAddMode = false;
    }

    // method: returns all the points into the current path
    this.getPathPoints = function() {
        var points = [];

        path.forEach(function(point) {
            points.push({
                lat: point.lat(),
                lng: point.lng()
            });
        });

        return points;
    }

    // method: enables or disables the snap to road for newly added points
    this.setSnapToRoad = function(status) {
        if (Boolean(status) === true) {
            settings.snapToRoad = true;
        } else {
            settings.snapToRoad = false;
        }
    }

    // method: set's the directions obtaining mode for snap to road feature
    this.setSnapToRoadMode = function(mode) {
        if (mode == 'driving' || mode == 'bicycling' || mode == 'walking') {
            settings.snapToRoadMode = snapToRoadTypes[mode];
        } else {
            throw new Error('Invalid snapToRoad mode');
        }
    }

    // NOT USED FOR NOW!
    this.setPathEditable = function(status) {
        if (polyLine !== null) {
            polyLine.setEditable(Boolean(status));
        }
    }

    // method: changes map zoom level
    this.setZoom = function(zoom) {
        if (gmap !== null) {
            gmap.setZoom(parseInt(zoom, 10));
        }
    }

    // method: retrieves the map zoom level
    this.getZoom = function() {
        if (gmap !== null) {
            return gmap.getZoom();
        }
    }

    // method: changes the map's width
    this.setWidth = function(width) {
        settings['width'] = parseInt(width, 10);
        mapElem.style.width = settings.width + 'px';
    }

    // method: changes the map's height
    this.setHeight = function(height) {
        settings['height'] = parseInt(height, 10);
        mapElem.style.height = settings.height + 'px';
    }

    // method: setter for the path changed event (triggered when points are added, deleted or moved)
    this.setPathChangeHandler = function(funcHandler) {
        if (typeof funcHandler === 'function') {
            pathChangeHandler = funcHandler;
        } else {
            throw new Error('Invalid handler provided. Function expected');
        }
    }

    // method: this method is triggered every time an path change event occurs (points are added, deleted or moved)
    this.handlePathChangeEvent = function() {
        if (typeof pathChangeHandler === 'function') {
            pathChangeHandler(jstrack.getPathPoints());
        }
    }

    // method: performs all the editors needed intialisations
    this.initMapTrackAndEvents = function() {
        // reference to the map HTML element
        mapElem = document.getElementById(settings.mapId);

        // default map options, based mostly on editor settings
        var mapOptions = {
            center: new google.maps.LatLng(settings.center.lat, settings.center.lng),
            zoom: settings.zoom,
            panControl: settings.panControl,
            streetViewControl: settings.streetViewControl,
            mapTypeControlOptions: {
                style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
            },
            mapTypeId: google.maps.MapTypeId.HYBRID
        };

        // map instance
        gmap = new google.maps.Map(mapElem, mapOptions);

        // making sure the editor has the correct width and height
        jstrack.setWidth(settings.width);
        jstrack.setHeight(settings.height);

        if (settings.points.length > 0) {
            // there are points to init the track
            jstrack.setPathPoints(settings.points);
        }

        console.log(settings.editable);

        // editor track line settings
        var polyLineOptions = {
            path: path,
            strokeColor: settings.color,
            strokeOpacity: 0.5,
            strokeWeight: 5,
            editable: true
        }

        // track line reference
        polyLine = new google.maps.Polyline(polyLineOptions);
        polyLine.setMap(gmap);

        // click on the map listener
        google.maps.event.addListener(gmap, 'click', function(event) {
            if (settings.snapToRoad == true && path.getLength() > 0) {
                // using directions service to retrieve points when in snap to road mode
                dservice.route({
                    origin: path.getAt(path.getLength() - 1),
                    destination: event.latLng,
                    travelMode: settings.snapToRoadMode
                }, function(result, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        for (var i = 0, len = result.routes[0].overview_path.length; i < len; i++) {
                            // adding all the routes points to the path
                            path.push(result.routes[0].overview_path[i]);
                            routeAddMode = true;
                        }

                        // setting add mode on false only after the loop is finished
                        routeAddMode = false;
                    }
                });
            } else {
                // snap to road mode is disabled, just adds the point where was clicked to the line
                path.push(event.latLng);
            }
        });

        // this triggers when a point position was changed
        google.maps.event.addListener(polyLine.getPath(), 'set_at', function() {
            jstrack.handlePathChangeEvent();
        });

        // this triggers when a point was added by dragging a middle point
        google.maps.event.addListener(polyLine.getPath(), 'insert_at', function() {
            if (routeAddMode === false) {
                // a small timout is required in order to have the path properly computed before triggering
                setTimeout(function() {
                    jstrack.handlePathChangeEvent();
                }, 300);
            }
        });

        // this handles the right click on the editor line, by deleting the point if the event occurent on a point
        google.maps.event.addListener(polyLine, 'rightclick', function(event) {
            var removed = false;

            path.forEach(function(point, index) {
                if (event.latLng.equals(point)) {
                    path.removeAt(index);
                    removed = true;
                }
            });

            if (removed === true) {
                // a point was removed, triggering the path changed event
                jstrack.handlePathChangeEvent();
            }
        });

        // handles the double click on the track line
        google.maps.event.addListener(polyLine, 'dblclick', function(event) {
            var pointsNo = path.getLength();
            var clickedPoint = null;

            // checking to see if the event occurent on a point
            path.forEach(function(el, index) {
                if (event.latLng.equals(el)) {
                    clickedPoint = index;
                }
            });

            // there arent't enough points for a multi delete or the event occured on first or the last point
            if ((pointsNo < 3) || (clickedPoint == 0) || (clickedPoint == pointsNo - 1)) {
                return;
            }

            if (clickedPoint !== null) {
                // performing the multi delete

                // a temporary path needs to be defined to keep the remaining points
                // (ugly workaround for the MVCArray.removeAt issue)
                var tempPath = new google.maps.MVCArray;

                if (isAltPressed === true) {
                    // if the alt button is pressed there are deleted the points from
                    // the beginning of the track to the double clicked point

                    for (i = 0; i <= clickedPoint; i++) {
                        tempPath.push(path.getAt(i));
                    }
                }

                if (isShiftPressed === true) {
                    // if the shift button is pressed there are deleted the points from
                    // the clicked point to the end of the track

                    for (i = clickedPoint; i < pointsNo; i++) {
                        tempPath.push(path.getAt(i));
                    }
                }

                // adding the newly created path in place of the existing one
                path.clear();
                tempPath.forEach(function(p, i) {
                    path.push(p);
                });

                polyLine.setOptions({
                    path: path
                });

                // removing the temporary path
                tempPath.clear(); tempPath = null;

                // triggering the path changed event
                jstrack.handlePathChangeEvent();
            }
        });

        // on key down listener, used to switch the Alt and Shift indicators status
        document.onkeydown = function(event) {
            var keyId = parseInt(event.keyCode, 10);

            if (keyId == 18) {
                isAltPressed = true;
            }

            if (keyId == 16) {
                isShiftPressed = true;
            }
        }

        // on key up listener, used to restore the Alt and Shift indicators status
        document.onkeyup = function(event) {
            var keyId = parseInt(event.keyCode, 10);

            if (keyId == 18) {
                isAltPressed = false;
            }

            if (keyId == 16) {
                isShiftPressed = false;
            }
        }
    }

    // needed before the initialisations
    jstrack = this;

    // inits the editor
    this.initMapTrackAndEvents();

}