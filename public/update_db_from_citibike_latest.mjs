
/*jshint esversion: 11 */

// let config = import('./config.js');
import got from 'got';
// import { get } from 'request-promise';
let mysql = import('promise-mysql');
var connection;

let config = {
    host: "mysql2-p2.ezhostingserver.com",
    user: "bikeangelhero",
    password: "DEKr4LBpaviDrGW",
    database: "bike_angel_hero_mdb"
};

const url = "https://layer.bicyclesharing.net/map/v1/nyc/map-inventory";

var BreakException = {}; // to break out of a loop since js doesn't have break statement

async function getDbConnection() {
    try {
        // console.log('connecting to mysql ' + mysql);

        connection = await (await mysql).createConnection(config);
        // console.log("promise-mysql object" + connection);
        return connection;
    } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
    }

}

async function getCitbikeStationsFromUrl() {
    try {
        console.log('Getting data from citibike url');
        const stationData = await got(url);
        // console.log('got url');
        // console.log('Read citibike file: ' + stationData.body);
        return JSON.parse(stationData.body);

        //=> '<!doctype html> ...'
    } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
    }

    // throw BreakException;

}

function populateInsert(stationDataArray) {
    let todo = [];
    console.log('populate insert');
    stationDataArray.forEach(element => {
        try {
            const score = element?.properties?.bike_angels?.score;
            // console.log(score);

            if (score) {
                let properties = element.properties;
                // // console.log(element.properties.station.id, element.properties.bike_angels.score);
                todo.push([element.properties.station.id, score,
                properties.bike_angels_action, properties.bike_angels_points],
                );
            }
        } catch (error) {
            console.log(error);
            //=> 'Internal server error ...'
        }
        // throw BreakException;
    });
    // console.log('inserting' + todo);
    return todo;
}


// insert current rows into current rows table
async function insertRows(todo) {
    try {
        console.log('inserting rows');

        console.log('Connected to db' + connection);
        let truncateTable = ' truncate table stations_current';
        await connection.query(truncateTable);
        console.log("Table truncated");
        let sql = 'INSERT INTO stations_current (stationid, bike_angelsscore, bike_angels_action, bike_angels_points) VALUES ?';
        let rtn = await connection.query(sql, [todo]);

        // console.log("Inserted rows into station_current");
        return rtn;
    } catch (e) {
        console.log(e);
    }
}

async function getBestBikeStationCombos() {
    try {

        let bestBikeStationCombos = 'call getBestBikeStationCombos()';
        return await connection.query(bestBikeStationCombos);

    } catch (e) {
        console.log(e);
    }

}

export const updateDbFromCitibikeLatest =
    async function () {
        try {
            console.log('In function: Updating db from citibike data');
            let stationData = await getCitbikeStationsFromUrl();
            var stationDataArray = stationData.features;
            console.log('# of stations: ' + stationDataArray.length);
            let connection = await getDbConnection();
            let todo = populateInsert(stationDataArray);
            console.log('Non-null rows to insert: ' + todo.length);
            let success = await insertRows(todo);
            // console.log('Inserted rows in station_current: ' + success);

            let bestCombos = await getBestBikeStationCombos();
            await connection.end();
            // console.log(bestCombos);
            return bestCombos;
        } catch (error) {
            console.log(error);
            //=> 'Internal server error ...'
        }
    };


// module.exports.updateDbFromCitibikeLatest = updateDbFromCitibikeLatest;