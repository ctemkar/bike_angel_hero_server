/*jshint esversion: 11 */

let nodeGeocoder = require('node-geocoder');

let options = {
    provider: 'google',
    apiKey: 'AIzaSyDtkiqTG5FSZp7wbt0iaNCxCUHgNgUzGg8', // for Mapquest, OpenCage, Google Premier
    formatter: null
};

// { lat: 40.767272160, lon: -73.9939288800 } - Manhattan
let geoCoder = nodeGeocoder(options);
// Reverse Geocode
geoCoder.reverse({ lat: 40.71395637809064, lon: -73.96329486877731 })
    .then((res) => {
        console.log(res);
    })
    .catch((err) => {
        console.log(err);
    });