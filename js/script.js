//Initialise the map.
var map;
//Api for Open weather map.
var weatherApi = "d6224aa5c25112cfd119322d91699e5c";

//Set the initial coordinates to the middle of the Wales.
function initMap() {
    var initialMap = {
        center: new google.maps.LatLng(52.130661, -3.783712),
        zoom: 8
    };

    //Passing in the settings above to display a map within the map-canvas div.
    map = new google.maps.Map(document.getElementById('map-canvas'), initialMap);

    //Run the function that adds all the markers to the map.
    addMarkers(markers);

    //Show or hide markers depending on visibility setting on the list.
    displayVisibleMarkers();
}

var viewModel = {
    //filtering of skateparks
    query: ko.observable(''),
    //weather
    name: ko.observable(''),
    weather: ko.observable(''),
    icon: ko.observable(''),

    triggerMarker: function(data){
      console.log(data.contentString);

      var marker = new google.maps.Marker({
        map: map,
        position: new google.maps.LatLng(data.lat, data.lng),
        title: data.title,
        });

      //Adds the above content to a skatepark marker infoWindow.
      var infowindow = new google.maps.InfoWindow({
          content: data.contentString
      });

      //Adds the content to the infoWindow
      infowindow.setContent(data.contentString);
      infowindow.open(map, marker);

      //Adds an awesome bouncing effect.
      marker.setAnimation(google.maps.Animation.BOUNCE);
      //Times out the bouncing effect.
      setTimeout(function () {
          marker.setAnimation(null);
      }, 1400);

      //Generates open weather map query string.
      var weatherQueryString = "http://api.openweathermap.org/data/2.5/weather?lat=" + data.lat + "&lon=" + data.lng + "&appid=" + weatherApi;

      //Update the knockout view models for weather at that skatepark.
      $.getJSON(weatherQueryString, function(data) {
                // Check if city name is undefined, if not show it.
                if(data.name != undefined){
                  viewModel.name(data.name);
                }
                // Check if weather description is undefined, if not show it.
                if(data.weather != undefined && data.weather.length > 0)
                  {
                    var iconCode = data.weather[0].icon;
                    var iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png";
                    viewModel.weather(data.weather[0].description);
                    viewModel.icon(iconUrl);
                  }
          }).fail(function() {
                alert( "Oops, couldn't load the weather. :(" );
              })

      //When skatepark is clicked from the list set the zoom to 14.
      map.setZoom(14);
      map.panTo(marker.getPosition());

    }
};

//Activating knockout. (Took me ages to figure that one out!!)
ko.applyBindings(viewModel);

//Adds the skatepark markers to the map.
function addMarkers(loc) {
    //Iterate using a loop to set each skatepark marker.
    for(i = 0; i < loc.length; i++) {
        loc[i].saveMarker = new google.maps.Marker({
          map: map,
          position: new google.maps.LatLng(loc[i].lat, loc[i].lng),
          title: loc[i].title,
        });

        //Sets the content for Googles infoWindow.
        loc[i].contentString = '<strong>' + loc[i].title + '</strong><br><p>' + loc[i].address + '<br>' + loc[i].city;

        //Adds the above content to a skatepark marker infoWindow.
        var infowindow = new google.maps.InfoWindow({
            content: markers[i].contentString
        });

        //Adds a listener to open the infoWindow when clicked.
        new google.maps.event.addListener(loc[i].saveMarker, 'click', (function(marker, i) {
          return function() {



            //Adds an awesome bouncing effect.
            marker.setAnimation(google.maps.Animation.BOUNCE);
            //Times out the bouncing effect.
            setTimeout(function () {
                marker.setAnimation(null);
            }, 1400);


            //Adds the content to the infoWindow
            infowindow.setContent(loc[i].contentString);
            infowindow.open(map,this);

            //Generate api query string.
            var weatherQueryString = "http://api.openweathermap.org/data/2.5/weather?lat=" + loc[i].lat + "&lon=" + loc[i].lng + "&appid=" + weatherApi;

            //Update the knockout view models for weather at that skatepark.
            $.getJSON(weatherQueryString, function(data) {
                      // Check if city name is undefined, if not show it.
                      if(data.name != undefined){
                        viewModel.name(data.name);
                      }
                      // Check if weather description is undefined, if not show it.
                      if(data.weather != undefined && data.weather.length > 0)
                        {
                          var iconCode = data.weather[0].icon;
                          var iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png";
                          viewModel.weather(data.weather[0].description);
                          viewModel.icon(iconUrl);
                        } else {
                          viewModel.weather("Oops, couldn't load the weather.")
                        }
                }).fail(function() {
                      alert( "Oops, couldn't load the weather. :(" );
                    })

            //Sets the pin to the center of the map once pin or list item is clicked.
            map.panTo(marker.getPosition());
          };
        })(loc[i].saveMarker, i));
    }
}

//Run through skatepark list in the sidebar and only show results that are searched for in the filter box.
//Using the knockout js function computed to return multiple results.
viewModel.markers = ko.computed(function() {
    var self = this;
    //Take the filter query and converts to lowercase.
    var filterQuery = self.query().toLowerCase();
    //Returns the computed value of the array (I think?)
    return ko.utils.arrayFilter(markers, function(marker) {

    if (marker.title.toLowerCase().indexOf(filterQuery) >= 0) {
            //if the filter query matches the start of a skatepark set the filterBool to true.
            marker.filterBool = true;
            return marker.visible(true);
        } else {
            //if the filter query doesnt the start of a skatepark set the filterBool to false.
            marker.filterBool = false;
            //And show all the visible markers.
            return marker.visible(false);
        }
    });
}, viewModel);


//Iterates through each marker to see if it should be visible on the skatepark list.
function displayVisibleMarkers() {
  for (var i = 0; i < markers.length; i++) {
    //If the filterBool is set to true display the marker!
    if(markers[i].filterBool === true) {
    markers[i].saveMarker.setMap(map);
    } else {
    //If the filterBool is set to false dont show the marker!
    markers[i].saveMarker.setMap(null);
    }
  }
}

//Toggle the sidebar on and off for mobile responsive behavour.
$(document).ready(function() {
  $('[data-toggle=offcanvas]').click(function() {
    $('.row-offcanvas').toggleClass('active');
  });
});

//Error handling for Google Map
function mapError(){
  alert("Oh sorry, we couldnt load the map!");
}
