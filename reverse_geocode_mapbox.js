const request = require('request');
var ACCESS_TOKEN = 'pk.eyJ1IjoiY3RlbWthciIsImEiOiJja3Vva28yMWYydWF4Mm5waDVmMWgxN29zIn0.DOpyrvYecSGrQdHYrlJCAQ';

const reverseGeocoding = function (latitude, longitude) {

    var url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
        + longitude + ', ' + latitude
        + '.json?access_token=' + ACCESS_TOKEN;

    request({ url: url, json: true }, function (error, response) {
        if (error) {
            console.log('Unable to connect to Geocode API');
        } else if (response.body == 0) {
            console.log('Unable to find location. Try to'
                + ' search another location.');
        } else {
            console.log(response.body.features[0].place_name);
        }
    })
}

// Sample data (Indore lat-long)
var latitude = 22.7196;
var longitude = 75.8577;

// Function call
reverseGeocoding(latitude, longitude);
