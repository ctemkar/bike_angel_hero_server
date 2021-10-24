let config = require("./public/config");
var mysql = require('mysql');
var pool = mysql.createPool(config);

const fs = require('fs');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
// ...

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use('/static', express.static('public'))
  //.set('views', path.join(__dirname, 'views'))
  // .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/getcombo', async (req, res) => {
    let getcombo = await require('./public/get_combos_html.js');
    res.send(getcombo);
  })
  // .get('/getappcombos', async (req, res) => {
  //   let getcombo = await require('./public/get_app_combos');
  //   res.send(getcombo);
  // })
  .get('/getcombosfromdb', async (req, res) => {
    let getcombo = await require('./public/getcombdatafromdb.js');
    res.status(200).send(getcombo);
    // res.send(getcombo);
  })
  .get('/getappcombos', async function (req, res, next) {
    let getcombo = await require('./public/getcombdatafromdb.js');
    var context = {};
    let lat = req?.query?.lat;
    let lon = req?.query?.lon;
    let sort = req?.query?.sort;
    console.log(`lat = ${lat}, lon = ${lon}, sort = ${sort}`);
    let qry = `call ComboWithOptions(NULL, NULL, ${sort});`;
    if (lat && lon) {
      qry = `call ComboWithOptions(${lat}, ${lon}, ${sort});`;
    }
    console.log(`Query: ${qry}`);

    pool.query(qry, function (err, rows, fields) {
      if (err) {
        next(err);
        return;
      }
      //context.results = JSON.stringify(rows);
      //console.log(rows);
      res.status(200).send(rows[0]);
    });
  })
  .listen(PORT, () => console.log(`Listening on ${PORT}`));
