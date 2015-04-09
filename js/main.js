// The mapPin constructor class takes in logic from the View Model to display the pins you see on the map.

function mapPin(name, lat, long, contentString) {

    this.name = ko.observable(name);
    this.lat = ko.observable(lat);
    this.long = ko.observable(long);
    this.content = ko.observable(contentString);

    // This initializes the markers on the map. It also adds an annimation too.

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, long),
        map: mapView,
        animation: google.maps.Animation.DROP
    });

    // This initalizes the info window when the markers are clicked.

    var infoWindow = new google.maps.InfoWindow({
        content: name + lat + long

    })

    // This function causes the markers to bounce when they are clicked.

    function toggleBounce() {

        if (marker.getAnimation() != null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }

    // This calls the both functions.
    
    google.maps.event.addListener(marker, 'click', toggleBounce);
    google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open(mapView, marker);
    });

}

// This triggers the map to display on the screen when called on.

var mapView = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 12,
    center: new google.maps.LatLng(61.196148, -149.885577),
});

// The view model takes in a name, lattitude and longitude and data from the API.

var viewModel = {
    pins: ko.observableArray([
        new mapPin("Charlies Bakery", 61.196148, -149.885577, content),
        new mapPin("Moose's Tooth", 61.190491, -149.868937, content)
    ])
};

// Initiates the viewModel bindings.

var content = document.createElement('div')
content.id = "content"

var apiData = function() {

    var wikipediaURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + name + '&format=json&callback=wikiCallback';
    var wikiRequestTimeout = setTimeout(function () {
        $content.text("Failed to get Wikipedia resources");
    }, 8000);

    $.ajax({

        url: wikipediaURL,
        dataType: "jsonp",

        success: function (response) {
            var articleList = response[1];

            for (var i = 0; i < articleList.length; i++) {
                articleStr = articleList[i];
                var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                $content.append('<li><a href ="' + url + '">' + articleStr + '</a></li>');
            };

            clearTimeout(wikiRequestTimeout);
        }
    });

}

ko.applyBindings(viewModel);
apiData();