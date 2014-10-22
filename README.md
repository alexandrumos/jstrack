![jstrack preview](http://alexandrumos.com/jstrack.png)

# jstrack

## About

jstrack is a small JavaScript class which helps building quick an simple track editor. It's built on top of Google Maps JS API and uses an editable PolyLine as track. Supports "snap to road" and point by point modes. When in "snap to road" the track will follow existing roads.


## Editor

Click on the map to add a point. If the editor is in "snap to road" mode the line will follow the roads until the clicked point. If it's not in "snap to road" mode, it will just draw a straight line to the clicked point.

To delete a point right click on it. The editor also supports multi-points delete by double clicking on a point while holding:

* ALT key: delete all points from the first point in the track to the double clicked one.
* SHIFT key: delete all points from the clicked one to the last point of the track.

## Usage

The simplest way of using it in a page is by creating a DIV in which the editor will be rendered:

```
<div id="map"></div>
```

Then instantiate the editor:

```javascript
var track = new jstrack('map');
```

Also the map can be instantiated by using an object instead of the map element ID:

```javascript
var track = new jstrack({
	mapId: 'map',
    width: 700,
    height: 500,
    snapToRoad: true,
    ...
});
```

Here are all the accepted attributes for the object:

Attribute         | Values        | Default   | Details
----------------- | ------------- | --------- | ---------------
mapId             | string        | -         | Map's HTML div ID
width             | numeric		   | 500       | Editor width 
height            | numeric       | 500       | Editor height 
color             | string        | '#ff0000' | Line color (default red)
zoom              | numeric       | 10        | Map initial zoom (it's not used if list of points is provided - it will compute the bounds for that line and it will fit the map centered on the line regardles the zoom value set)
center            | object        | lat: 0.0, lng 0.0 | Map initial center points (used only if a list of points is not provided)
snapToRoad        | boolean       | false     | Mode for snap to road functionality. When set on true the new track points will follow roads
snapToRoadMode    | string        | driving   | The snap to road routing mode. Accepted values: **driving**, **bicycling** or **walking**
panControl        | boolean       | false     | On true the map will show the pan control
streetViewControl | boolean       | false     | On true the map will show the StreetView contor into the map
points            | array         | []        | Using this attribute the points which will form the editable path can be set on instantiation. The accepted format is an array of objects, each having a **lat** (latitude) and **lng** (longitude) value. For example: [{ lat: 1.2, lng: 2.3 }, { lat: 4.5, lng: 5.6 }, ...]



### Methods

The track editor object has some methods:

#### setCenter( lat, lng )
Moves the map into the indicated point.

```javascript
track.setCenter( 45.662467 , 22.387090);
```

#### setPathPoints( arrayOfPoints )
Changes the editor line to the one defined by the points from the *arrayOfPoints*.

```javascript
var points = [
	{ lat: 45.665886, lng: 22.421422 },
    { lat: 45.665136, lng: 22.417946 },
    { lat: 45.665136, lng: 22.415843 },
    { lat: 45.666846, lng: 22.411423 },
    { lat: 45.666696, lng: 22.407818 },
    { lat: 45.667295, lng: 22.405715 },
    { lat: 45.666036, lng: 22.402754 }
]

track.setPathPoints( 45.662467 , 22.387090 );
```

#### getPathPoints()
Returns an array containing all the points of the track. Format is the same as the input array for *setPathPoints* method.

#### setSnapToRoad( trueOrFalse )
Enables and disables the snap to road mode.

```javascript
// enable
track.setSnapToRoad( true );

// disable
track.setSnapToRoad( false );
```

#### setSnapToRoadMode( mode )
Sets the snap to road routing mode. Accepted values are:

* driving
* bicycling
* walking

```javascript
// driving
track.setSnapToRoadMode( 'driving' );

// bicycling
track.setSnapToRoadMode( 'bicycling' );

// walking
track.setSnapToRoadMode( 'walking' );
```

#### setZoom( zoomLevel )
Changes the map zoom to the indicated level.

```javascript
track.setZoom( 11 );
```

#### getZoom()
Returns the current map zoom level.

```javascript
var zoomLevel = track.getZoom();
```

#### setWidth( width )
Changes the editor map width.

```javascript
track.setWidth(1200);
```

#### setHeight( height )
Changes the editor map height.

```javascript
track.setHeight(600);
```

#### setPathChangeHandler( function )
This can be used in order to set an external handler for the event which is triggered when something changes with the track into the editor. Events which will trigger calling of the **function** are:

* a point was added to the track
* one or more points were deleted on the track
* position of one point was changed (point dragged to other place)

Once the event was triggered, the function is called with the output of **getPathPoints()** method.

Usage example:

```javascript
track.setPathChangeHandler(function(points) {
	console.log(points);
	// ... and do something else with the points
});

// or, another approach:

var trackChanged = function(points) {
	for (i in points) {
		console.log(i, points[i].lat, points[i].lng);
	}
}

track.setPathChangeHandler(trackChanged);
```

### Demos

An demo showing preety much all the functionalities can be viewed here: http://alexandrumos.com/jstrack

### Warning
I'm not an advanced JavaScript developer, this is one of my first object oriented projects made in JavaScript. Also it was tested only on a Mac in Firefox, Google Chrome and Safara. Seems to work fine. If you have anything to report please send it by GitHub **issues**.

### License
This code is released under MIT license: http://opensource.org/licenses/MIT
Use it as you wish!

