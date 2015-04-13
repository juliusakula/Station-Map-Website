function Model() {

     // Generates a HTML list.
     // This function takes in the articleList array defined in viewModel.
     // It returns a HTML string which is then placed in the Google Maps API info window.

    this.generateLists = function (articles) {
        var Info_Content = '<ol>\n';

        for (var i = 0; i < articles.length; i++) {
            var content = articles[i].content;
            var url = articles[i].url;

            // If articles.error is true it will styalize the data differently.

            if (articles[i].error) {
                Info_Content += '<h5 style="color: red">' + content + '</h5>';
            } else {
                Info_Content += '<li><a href="' + url + '">' + content + '</a></li>\n';
            }
        }

        Info_Content += '</ol>';

        return Info_Content;
    };
}

// Initiates the model.

var model = new Model();


var viewModel = function () {

    // This is where all of the data is pulled from using KO observables. For better referncing the variablbe self is assigned as this.

    var self = this;

    // Data is passed through article and then pushed to the articleList observable array. self.article takes content from the API call, a URL and an error boolean.

    self.articleList = ko.observableArray();

    self.article = function (content, url, error) {
        this.content = content;
        this.url = url;
        this.error = error;
    };

    // Initial map setup.
    var map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 13,
        center: new google.maps.LatLng(51.497477, -0.127290),
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });

    // After declaring infowindow as a variable a single info window can then be used across all of the locations.
    var infowindow = new google.maps.InfoWindow();

    // Data is pushed into self.mapPin to generate new location pins on the map. This function takes in a name, lattitude, longitude and some text from the self.pins observable.

    self.mapPin = function (name, lat, lon, text) {

        // Additional observables are defined.

        this.name = ko.observable(name);
        this.lat = ko.observable(lat);
        this.lon = ko.observable(lon);
        this.text = ko.observable(text);

        // Setup for the map markers.

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lon),
            map: map,
            animation: google.maps.Animation.DROP
        });

        // This boolean keeps track of if the map marker is visible on the screen or not. The subscribe function is what triggers them to appear 
        // and dissapear when the search bar is being used.

        this.isVisible = ko.observable(false);

        this.isVisible.subscribe(function (currentState) {
            if (currentState) {
                marker.setMap(map);
            } else {
                marker.setMap(null);
            }
        });

        this.isVisible(true);

        // infowindowData sets up additional HTML for the info window.

        var infowindowData = "<h1>" + name + "</h1>" + "<p>" + text + "</p>" + "<h3>Related Wikipedia Articles:</h3>";

        // These are the functions that are called when the map markers are clicked.

        google.maps.event.addListener(marker, 'click', function () {
            // It sends the AJAX request first.
            self.apiData(name);

            // Waits 500ms for the AJAX request to finish.
            window.setTimeout(function () {
                infowindow.setContent(infowindowData + model.generateLists(self.articleList()));
                infowindow.open(map, marker);
            }, 500);

        });

        // This function provides similar functionality for the list view as google.maps.event.addListener

        this.pan = function () {
            self.apiData(name);

            window.setTimeout(function () {
                infowindow.setContent(infowindowData + model.generateLists(self.articleList()));
                infowindow.open(map, marker);
                map.panTo(marker.position);
            }, 500);

        };
    };

    // This is where all of the locations are input. They require a name, lattitude, longitude and some description text.

    self.pins = ko.observableArray([
        new self.mapPin("Waterloo Station", 51.503035, -0.112326, "Waterloo is a London Underground station located within the Waterloo station complex that incorporates both the tube station and the mainline railway station. It is the busiest station on the Underground network with over 89 million passenger entries and exits in 2013, and it is served by four lines: the Bakerloo, Jubilee, Northern and Waterloo & City lines,"),
        new self.mapPin("King's Cross Station", 51.530984, -0.122583, "King's Cross railway station is a major London railway terminus, opened in 1852. It is on the northern edge of central London, at the junction of Euston Road and York Way, in the London Borough of Camden on the boundary with the London Borough of Islington. It is one of 19 stations managed by Network Rail."),
        new self.mapPin("Putney Bridge", 51.468050, -0.209081, "Putney Bridge is a London Underground station on the Wimbledon branch of the District line. It is between Parsons Green and East Putney stations and is in Zone 2. The station is located in the south of Fulham, adjacent to Fulham High Street and New Kings Road (A308) and is a short distance from the north end of Putney Bridge from which it takes its name."),
        new self.mapPin("Piccadilly Circus", 51.510271, -0.134211, "Piccadilly Circus is a London Underground station located directly beneath Piccadilly Circus itself, with entrances at every corner. Located in Travelcard Zone 1, the station is on the Piccadilly line between Green Park and Leicester Square and on the Bakerloo line between Charing Cross and Oxford Circus."),
        new self.mapPin("Embankment Tube Station", 51.507225, -0.122215, "Embankment is a London Underground station in the City of Westminster, known by various names during its history. It is served by the Circle, District, Northern and Bakerloo lines. On the Northern and Bakerloo lines, the station is between Waterloo and Charing Cross stations; on the Circle and District lines, it is between Westminster and Temple and is in Travelcard Zone 1. The station has two entrances, one on Victoria Embankment and the other on Villiers Street. The station is adjacent to Victoria Embankment Gardens and is close to Charing Cross station, Embankment Pier, Hungerford Bridge, Cleopatra's Needle, the Royal Air Force Memorial, the Savoy Chapel and Savoy Hotel and the Playhouse and New Players Theatres.")
    ]);

    // self.query begins empty as it's used later for self.filterPins.

    self.query = ko.observable('');

    // Searches through the pins and checks to see if they match the string input into the text box. It then hides the pins that do not match.

    self.filterPins = ko.computed(function () {
        var search = self.query().toLowerCase();

        return ko.utils.arrayFilter(self.pins(), function (pin) {
            var doesMatch = pin.name().toLowerCase().indexOf(search) >= 0;

            pin.isVisible(doesMatch);

            return doesMatch;
        });
    });

    // AJAX request. This pulls in data from the Wikipedia API.


    self.apiData = function (name) {

        var wikipediaURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + name + '&format=json&callback=wikiCallback';

        parameters = {
            url: wikipediaURL,
            dataType: "jsonp",

            success: function (response) {
                self.articleList.removeAll();
                var articles = response[1];

                for (var i = 0; i < articles.length; i++) {
                    var name = articles[i];
                    var url = 'http://en.wikipedia.org/wiki/' + name;

                    // If the request is succesful it sets the article.error boolean to false.

                    self.articleList.push(new self.article(name, url, false));
                }
            },
            error: function () {
                self.articleList.removeAll();
                var errorResponse = "Unable to contact the Wikipedia database. Select another map marker to try again.";

                // If the AJAX request is unsuccesful no URL will be passed into the array so it's defined as null. We also set article.error to true so it triggers 
                // different styled text in the model.
                
                self.articleList.push(new self.article(errorResponse, null, true));
            }
        };

        $.ajax(parameters);
    };

};

// Initiates the viewModel bindings.
$(document).ready(function () {

    // If the Google Maps API fails to load it will trigger an alert prompting the user to refresh the page.

    if (!mapLoaded) alert("Google Maps has failed to load. Please refresh the page to try again.");
    ko.applyBindings(new viewModel());

});