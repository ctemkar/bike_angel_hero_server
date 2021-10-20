/*jshint esversion: 11 */

// let config = import('./config.js');
//const got = import('got');
import { updateDbFromCitibikeLatest } from './update_db_from_citibike_latest.mjs';

//const mysql = import('promise-mysql');



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
        console.log(error);
        //=> 'Internal server error ...'
    }

    // throw BreakException;

}

function populateInsert(stationDataArray) {
    let todo = [];
    stationDataArray.forEach(element => {
        try {
            const score = element?.properties?.bike_angels?.score;
            // // console.log(score);

            if (score) {
                let properties = element.properties;
                // // console.log(element.properties.station.id, element.properties.bike_angels.score);
                todo.push([element.properties.station.id, score,
                properties.bike_angels_action, properties.bike_angels_points],
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
        let sql = 'INSERT INTO stations_current (stationid, bike_angelsscore, bike_angels_action, bike_angels_points) VALUES ?';
        await connection.query(sql, [todo]);

        // console.log("Inserted rows into station_current");

    } catch (e) {
        // console.log(e);
    }
}

async function getComboHtml(bestBikeStationCombosResults) {
    try {

        // console.log('Getting best combos');
        //let bestBikeStationCombos = 'call getBestBikeStationCombos()';
        //bestBikeStationCombosResults = await connection.query(bestBikeStationCombos);
        // console.log(bestBikeStationCombosResults.length);
        let res = bestBikeStationCombosResults[0];
        // console.log(bestBikeStationCombosResults[0][5].angel_points);
        //     angel_points: 6,
        //     google_distance: 426,
        //     walking_distance: 0.26,
        //     walking_time: '5:49',
        //     pickup_from: 'Tiebout Ave & E Fordham Road',
        //     dropoff_to: 'Grand Concourse & E 192 St'
        //   
        var reo = '<!DOCTYPE html><html lang="en"><head>' +
            '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
            '<link rel="stylesheet" href="/static/tableformat.css">' +
            '<script src="/static/sorttable.js"></script>' +
            '<title>Bike Angel Combos</title>' +
            '</head>' +
            '<body> ';

        var table = '';
        const googleMapsDirectionsUrl = "https://www.google.com/maps/dir/?api=1&travelmode=bicycling";
        for (let i = 0; i < res.length; i++) {
            let item = res[i];
            // console.log("Row: " + i + "\n");
            // console.log(res[i].angel_points);
            // console.log(res[i].google_distance);
            // console.log(res[i].walking_distance);
            // console.log(res[i].walking_time);
            // console.log(res[i].pickup_from);
            // console.log(res[i].dropoff_to);

            const directionLink = '<a href=' + googleMapsDirectionsUrl + "&origin=" + encodeURIComponent("Citi Bike: " + item.pickup_from) +
                "&destination=" + encodeURIComponent("Citi Bike: " + item.dropoff_to) + '>' + item.google_distance + '</a';

            table += '<tr><td>' + item.angel_points + '</td><td>' + directionLink + '</td><td>' +
                item.walking_time + '</td><td>' + item.pickup_from +
                '</td><td>' +
                res[i].dropoff_to + '</td></tr>';

            // throw BreakException;
        }

        table = '<table class="sortable"><thead><tr>' +
            '<th>Points</th><th>Distance</th><th>Walk Time</th><th>Pick up</th><th>Drop off</th></tr></thead><tbody>' +
            table + '</tbody></table>';
        // console.log(reo + table);

        return reo + table + '</body></html>';

    } catch (e) {
        console.log(e);
    }

}


export const getHtml =
    async function () {

        try {
            /*
                    let stationData = await getCitbikeStationsFromUrl();
                    var stationDataArray = stationData.features;
                    // console.log('# of stations: ' + stationDataArray.length);
                    const connection = await getDbConnection();
                    todo = populateInsert(stationDataArray);
                    // console.log('Non-null rows to insert: ' + todo.length);
                    const success = await insertRows(connection, todo);
                    */
            console.log('Updating db with latest citibike data');
            // await updateDbFromCitibikeLatest();

            // console.log('Done');
            let html = await (getComboHtml(comboResults));

            return html;
        } catch (error) {
            console.log(error);
            //=> 'Internal server error ...'
        }
    };

module.exports = (async () => {
    try {
        comboResults = await updateDbFromCitibikeLatest();

        let html = await getHtml();
        // console.log(html);
        return html;
        //=> '<!doctype html> ...'
    } catch (error) {
        console.log(error);
        //=> 'Internal server error ...'
    }
    // console.log(stationData.body);
})();


