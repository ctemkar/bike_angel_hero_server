/*jshint esversion: 11 */

let config = require('./config.js');
const got = require('got');

// const { features } = require('process');
// var mysql = require('mysql');
const mysql = require('promise-mysql');


var BreakException = {}; // to break out of a loop since js doesn't have break statement

var comboResults;
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

function populateInsert(stationDataArray) {
    let todo = [];
    stationDataArray.forEach(element => {
        try {
            const score = element?.properties?.bike_angels?.score;
            const lat = element.geometry.coordinates[1];
            const lon = element.geometry.coordinates[0];
            // // console.log(score);

            if (score) {
                let properties = element.properties;
                // // console.log(element.properties.station.id, element.properties.bike_angels.score);
                todo.push([element.properties.station.id, score,
                properties.bike_angels_action, properties.bike_angels_points, lat, lon],
                );
            }
        } catch (e) {
            // console.log(e);
        }
        // throw BreakException;
    });

    return todo;
}


// insert current rows into current rows table
async function insertRows(connection, todo) {
    try {
        // console.log('Connected to db');
        let truncateTable = ' truncate table stations_current';
        await connection.query(truncateTable);
        // console.log("Table truncated");
        let sql = 'INSERT INTO stations_current (stationid, bike_angelsscore, bike_angels_action, bike_angels_points, latitude, longitude) VALUES ? ';
        await connection.query(sql, [todo]);

        // console.log("Inserted rows into station_current");

    } catch (e) {
        // console.log(e);
    }
}

async function getBestBikeStationCombos(connection) {
    try {

        // console.log('Getting best combos');
        let bestBikeStationCombos = "select b.`bike_angels_points` + c.`bike_angels_points` as angel_points," +
            "a.google_distance, `google_walking_time` walking_time," +
            "`stationname` pickup_from, `stationnamenear` dropoff_to, " +
            "a.latitude, a.longitude " +
            " from stations_near a " +
            " inner join stations_current b ON a.stationid = b.stationid " +
            " inner join stations_current c ON a.stationid_near = c.stationid " +
            " where " +
            " b.`bike_angels_action` = 'take' AND c.`bike_angels_action` = 'give'" +
            " and c.`bike_angels_points` is not null" +
            " and `google_distance` is not null " +
            " order by angel_points DESC, `google_distance` ASC" +
            " LIMIT 300;";
        console.log(bestBikeStationCombos);

        bestBikeStationCombosResults = await connection.query(bestBikeStationCombos);
        console.log(bestBikeStationCombosResults.length);
        res = bestBikeStationCombosResults;

        return res;

    } catch (e) {
        // console.log(e);
    }

}

module.exports = (async () => {
    try {
        const connection = await getDbConnection();
        comboResults = await getBestBikeStationCombos(connection);
        // module.exports = comboResults;
        await connection.end();
        console.log(comboResults);
        // console.log('Done');
        return comboResults;
    } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
    }
})();

