
/*jshint esversion: 11 */

const google = require("@googlemaps/google-maps-services-js");

let latitude = 28.54; //sub in your latitude
let longitude = -81.39;
getReverseGeocodingData(latitude, longitude);

function getReverseGeocodingData(lat, lng) {
    var latlng = new google.maps.LatLng(lat, lng);
    // This is making the Geocode request
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'latLng': latlng }, (results, status) => {
        if (status !== google.maps.GeocoderStatus.OK) {
            alert(status);
        }
        // This is checking to see if the Geoeode Status is OK before proceeding
        if (status == google.maps.GeocoderStatus.OK) {
            console.log(results);
            var address = (results[0].formatted_address);
        }
    });
}
/*

geocoder.geocode({ 'location': { lat: latitude, lng: longitude } }, function (results, status) {
    if (status === google.maps.GeocoderStatus.OK) {
        results.forEach(function (element) {
            element.address_components.forEach(function (element2) {
                element2.types.forEach(function (element3) {
                    switch (element3) {
                        case 'postal_code':
                            postal_code = element2.long_name;
                            break;
                        case 'administrative_area_level_1':
                            state = element2.long_name;
                            break;
                        case 'locality':
                            city = element2.long_name;
                            break;
                    }
                })
            });
        });
    }
});

*/

