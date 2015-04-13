function Model() {
    /**
     * Generates an HTML list
     * @param  {array} articles  array that contains Article objects defined in viewModel
     * @return {string}          returns a string of HTMl
     */
    this.generateLists = function (articles) {
        var Info_Content = '<ol>\n';

		for (var i = 0; i < articles.length; i++) {
			var content = articles[i].content;
			var url = articles[i].url;
				
			if (articles[i].error) {
				Info_Content += '<h5 style="color: red">' + content + '</h5>';
			}
				
			else {
				Info_Content += '<li><a href="' + url + '">' + content + '</a></li>\n';
			}
		}

        Info_Content += '</ol>';

        return Info_Content;
    };
}

var model = new Model();

// This is where all of our data is pulled from using observables.
var viewModel = function () {

    var self = this;

    self.articleList = ko.observableArray();

    self.article = function (content, url, error) {
        this.content = content;
        this.url = url;
		this.error = error;
    };

    // This sets up the map. The mapPin function uses this.
    var map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 13,
        center: new google.maps.LatLng(51.497477, -0.127290),
        mapTypeId: google.maps.MapTypeId.SATELLITE
    });

    // Use one infowindow object to keep it simple
    var infowindow = new google.maps.InfoWindow();

    self.mapPin = function (name, lat, lon, text) {

        // Here we setup the observables.

        this.name = ko.observable(name);
        this.lat = ko.observable(lat);
        this.lon = ko.observable(lon);
        this.text = ko.observable(text);

        // This setups up the map markers at the specified coordinates in the viewModel.

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(lat, lon),
            map: map,
            animation: google.maps.Animation.DROP
        });
		
		this.isVisible = ko.observable(false);

        this.isVisible.subscribe(function (currentState) {
            if (currentState) {
                marker.setMap(map);
            } else {
                marker.setMap(null);
            }
        });

        this.isVisible(true);
		
        // These are the functions that are called when the map markers are clicked.
		self.apiData(name);
		infowindow.setContent("<h1>" + name + "</h1>" + "<p>" + text + "</p>" + "<h3>Related Wikipedia Articles:</h3>" + model.generateLists(self.articleList()));

        google.maps.event.addListener(marker, 'click', function () {
            // Send AJAX request first

            // Wait for the AJAX call to finish 300 milliseconds later
            window.setTimeout(function () {
                infowindow.open(map, marker);
            }, 500);

        });
		
		this.pan = function () {
			self.apiData(name);
			
            window.setTimeout(function () {
                infowindow.setContent("<h1>" + name + "</h1>" + "<p>" + text + "</p>" + "<h3>Related Wikipedia Articles:</h3>" + model.generateLists(self.articleList()));
                infowindow.open(map, marker);
            }, 500);
			
			map.panTo(marker.position);
			
		};
    };

    self.pins = ko.observableArray([
      new self.mapPin("Waterloo Station", 51.503035, -0.112326, "Waterloo is a London Underground station located within the Waterloo station complex that incorporates both the tube station and the mainline railway station. It is the busiest station on the Underground network with over 89 million passenger entries and exits in 2013, and it is served by four lines: the Bakerloo, Jubilee, Northern and Waterloo & City lines,"),
      new self.mapPin("King's Cross Station", 51.530984, -0.122583, "King's Cross railway station is a major London railway terminus, opened in 1852. It is on the northern edge of central London, at the junction of Euston Road and York Way, in the London Borough of Camden on the boundary with the London Borough of Islington. It is one of 19 stations managed by Network Rail."),
      new self.mapPin("Putney Bridge", 51.468050, -0.209081, "Putney Bridge is a London Underground station on the Wimbledon branch of the District line. It is between Parsons Green and East Putney stations and is in Zone 2. The station is located in the south of Fulham, adjacent to Fulham High Street and New Kings Road (A308) and is a short distance from the north end of Putney Bridge from which it takes its name."),
      new self.mapPin("Piccadilly Circus", 51.510271, -0.134211, "Piccadilly Circus is a London Underground station located directly beneath Piccadilly Circus itself, with entrances at every corner. Located in Travelcard Zone 1, the station is on the Piccadilly line between Green Park and Leicester Square and on the Bakerloo line between Charing Cross and Oxford Circus."),
      new self.mapPin("Embankment Tube Station", 51.507225, -0.122215, "Embankment is a London Underground station in the City of Westminster, known by various names during its history. It is served by the Circle, District, Northern and Bakerloo lines. On the Northern and Bakerloo lines, the station is between Waterloo and Charing Cross stations; on the Circle and District lines, it is between Westminster and Temple and is in Travelcard Zone 1. The station has two entrances, one on Victoria Embankment and the other on Villiers Street. The station is adjacent to Victoria Embankment Gardens and is close to Charing Cross station, Embankment Pier, Hungerford Bridge, Cleopatra's Needle, the Royal Air Force Memorial, the Savoy Chapel and Savoy Hotel and the Playhouse and New Players Theatres.")
    ]);
	

    self.query = ko.observable('');

    self.filterPins = ko.computed(function () {
        var search = self.query().toLowerCase();

        return ko.utils.arrayFilter(self.pins(), function (pin) {
            var doesMatch = pin.name().toLowerCase().indexOf(search) >= 0;

            pin.isVisible(doesMatch);

            return doesMatch;
        });
    });
	

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
                    self.articleList.push(new self.article(name, url, false));
                }
            },
            error: function () {
				self.articleList.removeAll();
				var errorResponse = "Unable to contact the Wikipedia database. Select another map marker to try again."
                self.articleList.push(new self.article(errorResponse, null, true));
            }
        };

        $.ajax(parameters);
    };

};

// Initiates the viewModel bindings.
$(document).ready(function () {
	
	if (!mapLoaded) alert("Google Maps has failed to load. Please refresh the page to try again.");
    ko.applyBindings(new viewModel());
	
});

