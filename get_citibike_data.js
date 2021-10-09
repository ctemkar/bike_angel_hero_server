/*jshint esversion: 11 */

let config = require('./config.js');
const got = require('got');

// const { features } = require('process');
var mysql = require('mysql');


const url = "https://layer.bicyclesharing.net/map/v1/nyc/map-inventory";


let stationData;
(async () => {
    try {
        const stationData = await got(url);
        console.log('Read citibike file: ' + stationData.body);
        populateTable(stationData.body);
        //=> '<!doctype html> ...'
    } catch (error) {
        console.log(error?.response?.body);
        //=> 'Internal server error ...'
    }
    // console.log(stationData.body);
})();


function populateTable(stationJson) {
    var BreakException = {};
    jsonData = JSON.parse(stationJson);


    var stationDataArray = jsonData.features;
    // console.log(jsonData.features);
    console.log('Stations: ' + stationDataArray.length);

    let connection = mysql.createConnection(config);

    let sql = 'INSERT INTO stations_current (stationid, bike_angelsscore, bike_angels_action, bike_angels_points) VALUES ?';
    let todo = [];


    stationDataArray.forEach(element => {
        try {
            const score = element?.properties?.bike_angels?.score;
            // console.log(score);

            if (score) {
                let properties = element.properties;
                // console.log(element.properties.station.id, element.properties.bike_angels.score);
                todo.push([element.properties.station.id, score,
                properties.bike_angels_action, properties.bike_angels_points],
                );
            }
        } catch (e) {
            console.log(e);
        }
        // throw BreakException;
    });

    connection.connect(function (err) {
        try {
            if (err) throw err;
            console.log("Connected!");
            let truncateTable = ' truncate table stations_current';
            connection.query(truncateTable, function (err, result) {
                if (err) throw err;
                console.log("Table truncated");
            });
            console.log('# of rows: ' + todo.length);
            connection.query(sql, [todo], (err, results, fields) => {
                if (err) {
                    return console.error(err.message);
                }
                // get inserted id
                // console.log('Todo Id:' + results);
                console.log("Updated citibike data!");
            });

            let getBestBikeStationCombos = 'call GetBestBikeStationCombos();';
            connection.query(getBestBikeStationCombos, function (err, result) {
                if (err) throw err;

                Object.keys(result).forEach(function (key) {
                    var
                        row = result[key];
                    console.log(row);
                    // console.log('name: ' + row.station_name);
                    // console.log('points: ' + row.angel_points);
                });
                connection.pool.end();
            });



        } catch (e) {

        }



    });




}


