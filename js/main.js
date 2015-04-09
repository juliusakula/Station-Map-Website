// The mapPin fucntion takes in name, lat, long and text data from the viewModel.

var mapPin = function (name, lat, long, text) {

    // Here we setup the observables.

    this.name = ko.observable(name);
    this.lat = ko.observable(lat);
    this.long = ko.observable(long);
    this.text = ko.observable(text);

    // This setups up the map markers at the specified coordinates in the viewModel.

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(lat, long),
        map: map,
        animation: google.maps.Animation.DROP
    });

    // 

    var contentString = '<li data-bind="foreach: articleList"><a data-bind="attr: {href: url}, text: content"></a></li>';
    infowindow = new google.maps.InfoWindow;

    // These are the functions that are called when the map markers are clicked.

    google.maps.event.addListener(map, 'click', function () {
        infowindow.close();
    });

    google.maps.event.addListener(marker, 'click', function () {
        apiData(name);
        infowindow.setContent(contentString);
        infowindow.open(map, marker);
    });
}

// This sets up the map. The mapPin function uses this.

var map = new google.maps.Map(document.getElementById('map-canvas'), {
    zoom: 12,
    center: new google.maps.LatLng(61.196148, -149.885577),
});


// This is where all of our data is pulled from using observables.

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