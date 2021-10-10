/*jshint esversion: 11 */

let config = require('./config.js');
const got = require('got');

// const { features } = require('process');
// var mysql = require('mysql');
const mysql = require('promise-mysql');


var BreakException = {}; // to break out of a loop since js doesn't have break statement

const url = "https://layer.bicyclesharing.net/map/v1/nyc/map-inventory";

const getDbConnection = async () => {
    // console.log('connecting to mysql');
    return await mysql.createConnection(config);
};

async function getCitbikeStationsFromUrl() {
    try {
        const stationData = await got(url);
        // console.log('Read citibike file: ' + stationData.body);
        return JSON.parse(stationData.body);
        // populateTable(stationData.body);
        //=> '<!doctype html> ...'
    } catch (error) {
        console.log(error?.response?.body);
        //=> 'Internal server error ...'
    }

    // throw BreakException;

}
(async () => {
    try {
        let stationData = await getCitbikeStationsFromUrl();
        var stationDataArray = stationData.features;
        console.log('# of stations: ' + stationDataArray.length);
        todo = populateInsert(stationDataArray);
        console.log('Non-null rows to insert: ' + todo.length);
        const success = await insertRows(todo);
        const showResults = await getBestBikeStationCombos();
        console.log(showResults);
    } catch (error) {
        console.log(error?.response?.body);
        //=> 'Internal server error ...'
    }
})();

function populateInsert(stationDataArray) {
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

    return todo;
}


const getNearStations = async () => {
    console.log('Getting stations');
    const db = await getDbConnection();
    let sql = 'SELECT stationid, stationid_near, stationname, stationnamenear, latitude, longitude, latitude_near, longitude_near from stations_near WHERE google_distance IS NULL'; // where stationid<1000';

    const nearStations = await db.query(sql);
    await db.end();
    // console.log(nearStations);
    return nearStations;
};

// insert current rows into current rows table
async function insertRows(todo) {
    try {
        const connection = await getDbConnection();
        console.log('Connected to db');
        let truncateTable = ' truncate table stations_current';
        await connection.query(truncateTable);
        console.log("Table truncated");
        let sql = 'INSERT INTO stations_current (stationid, bike_angelsscore, bike_angels_action, bike_angels_points) VALUES ?';
        await connection.query(sql, [todo]);
        console.log("Inserted rows into station_current");

    } catch (e) {
        console.log(e);
    }
}

async function getBestBikeStationCombos(todo) {
    try {
        const connection = await getDbConnection();
        console.log('Getting best combos');
        let getBestBikeStationCombos = 'call getBestBikeStationCombos()';
        getBestBikeStationCombosResults = await connection.query(getBestBikeStationCombos);
        return getBestBikeStationCombosResults;

    } catch (e) {
        console.log(e);
    }

}



/*

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
*/

