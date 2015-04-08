// Anonymous function initalizes the map and takes in logic from the viewModel
// to display pins on the map. It uses observable Arrays so the data can easily
// be pulled for other areas of the site using data-binds.

function mapPin(name, lat, long) {

    this.name = ko.observable(name);
    this.lat = ko.observable(lat);
    this.long = ko.observable(long);

    var marker = new google.maps.Marker({
        title: name,
        position: new google.maps.LatLng(lat, long),
        map: mapInit

    });

    var mapOptions = {
        zoom: 12,
        center: new google.maps.LatLng(61.196148, -149.885577)
    }

    var mapInit = new google.maps.Map(document.getElementById('map-canvas'),
                                  mapOptions);

}

// The view model takes in a name, lattitude and longitude coordinates.

var viewModel = {
    pins: ko.observableArray([
        new mapPin("Charlies Bakery", 61.196148, -149.885577),
        new mapPin("Moose's Tooth", 61.190491, -149.868937)
    ])
};

// Initiates the viewModel bindings.

ko.applyBindings(viewModel);
