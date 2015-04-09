// The mapPin constructor class takes in logic from the View Model to display the pins you see on the map.
var mapPin = function(name, lat, long, text) {

    this.name = ko.observable(name);
    this.lat = ko.observable(lat);
    this.long = ko.observable(long);
    this.text = ko.observable(text);

    // This initializes the markers on the map. It also adds an annimation too.

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, long),
        map: mapView,
        animation: google.maps.Animation.DROP
    });

    // This initalizes the info window when the markers are clicked. It also creates a div for the API data.

    // This function pulls in data from the WikiPedia API.

    var contentString = '<li data-bind="foreach: articleList"><a data-bind="attr: {href: url}, text: content"></a></li>';
    var infowindow = new google.maps.InfoWindow({});

    google.maps.event.addListener(mapView, 'click', function () {
        infowindow.close();
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.close();
        infowindow = new google.maps.InfoWindow({
            content: text + contentString
        });

        infowindow.open(mapView, marker);
        apiData(name);
    });

}

// This triggers the map to display on the screen when called on.

var mapView = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 12,
    center: new google.maps.LatLng(61.196148, -149.885577),
});

// The view model takes in a name, lattitude and longitude.

var viewModel = function(name) {

    var self = this;

    this.articleList = ko.observableArray([]);

    this.pins = ko.observableArray([
        new mapPin("Alaska Communications", 61.196148, -149.885577, "test11"),
        new mapPin("Anchorage Alaska", 61.190491, -149.868937, "test2")
    ]);

    this.article = function (content, url) {

        var self = this;
        self.content = content;
        self.url = url;

    }

    this.apiData = function(name) {

        //TODO : Fix fail request.

        var wikipediaURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + name + '&format=json&callback=wikiCallback';
        var wikiFailText = 'Failed to get Wikipedia resources';
        var wikiRequestTimeout = setTimeout(function () {
            self.articleList.push(new article(wikiFailText, wikiFailText));
        }, 1000);

        $.ajax({

            url: wikipediaURL,
            dataType: "jsonp",

            success: function (response) {

                self.articleList.removeAll();

                var articleList = response[1];

                for (var i = 0; i < articleList.length; i++) {
                    articleStr = articleList[i];
                    var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                    self.articleList.push(new article(articleStr, url));
                }

                clearTimeout(wikiRequestTimeout);
            }
        });

    }
};


// Initiates the viewModel bindings.

ko.applyBindings(viewModel);