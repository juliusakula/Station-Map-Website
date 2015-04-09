// The mapPin constructor class takes in logic from the View Model to display the pins you see on the map.

function mapPin(name, lat, long, text) {

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


    // This function causes the markers to bounce when they are clicked. 

    function toggleBounce() {

        if (marker.getAnimation() != null) {
            marker.setAnimation(null);
        } else {
            marker.setAnimation(google.maps.Animation.BOUNCE);
        }
    }

    function article(content, url) {

        var self = this;
        self.content = content;
        self.url = url;

    }

    // This function pulls in data from the WikiPedia API.

    function apiData() {
        
        //TODO : Fix fail request.

        var wikipediaURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + name + '&format=json&callback=wikiCallback';
        var wikiFailText = 'Failed to get Wikipedia resources';
        var wikiRequestTimeout = setTimeout(function () {
            viewModel.articleList.push(new article(wikiFailText, wikiFailText));
        }, 5);

        $.ajax({

            url: wikipediaURL,
            dataType: "jsonp",

            success: function (response) {

                viewModel.articleList.removeAll();

                var articleList = response[1];

                for (var i = 0; i < articleList.length; i++) {
                    articleStr = articleList[i];
                    var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                    viewModel.articleList.push(new article(articleStr, url));
                }

                clearTimeout(wikiRequestTimeout);
            }
        });

    }

    var contentString = '<li data-bind="foreach: articleList"><a data-bind="attr: {href: url}, text: content"></a></li>';
    var infowindow = new google.maps.InfoWindow({});
    
    google.maps.event.addListener(mapView, 'click', function () {
        infowindow.close();
    });

    google.maps.event.addListener(marker, 'click', function () {
        infowindow.close();
        toggleBounce();
        infowindow = new google.maps.InfoWindow({
            content: text + contentString
        });

        infowindow.open(mapView, marker);
        apiData();
    });

}

// This triggers the map to display on the screen when called on.

var mapView = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 12,
    center: new google.maps.LatLng(61.196148, -149.885577),
});

// The view model takes in a name, lattitude and longitude.

var viewModel = {

    articleList: ko.observableArray([]),

    pins: ko.observableArray([
        new mapPin("Alaska Communications", 61.196148, -149.885577, "test11"),
        new mapPin("Anchorage Alaska", 61.190491, -149.868937, "test2")
    ]),

    // TODO

    query: ko.observable(''),
    

    search: function (value) {
        viewModel.pins[0].removeAll();

        for (var i in pins) {
            if (pins[i].name.toLowerCase().indexOf(valkue.toLowerCase()) >= 0) {
                this.pins.push(pins[i])
            }
        }
    }
};


// Initiates the viewModel bindings.

ko.applyBindings(viewModel);