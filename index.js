/* jshint esversion:8*/

// var express = require('express');
// var app = express();

// var things = require('./get_citibike_data.js');

//both index.js and things.js should be in same directory
// app.use('/things', things);

// app.listen(3000);

// var yourSuperAwesomeAPI = require('./public/get_citibike_data.js');
// var http = require('http');
// http.createServer(function (req, res) {
//   switch (req.url) {
//     case '/': res.write('website.com'); break;
//     case '/about_us': res.write('website.com/about_us'); break;
//     case '/api':
//       // yourSuperAwesomeAPI();
//       break;
//     default: res.write('website.com/error_404');
//   }
//   res.end();
// }).listen(5000);


const fs = require('fs');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
// var getcombo = require('./public/get_citibike_data.js');
// console.log("GetCombo: " + getcombo);
// ...

//var bestCombos = require('./get_citibike_data.js');

//both index.js and things.js should be in same directory
// app.use('/bestCombos', bestCombos);

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/getcombo', async (req, res) => {
    let getcombo = await require('./public/get_citibike_data.js');
    res.send(getcombo);
  })

  //fs.createReadStream('get_citibike_data.js').pipe(res))
  // .use('/getcombo', getcombo)

  .listen(PORT, () => console.log(`Listening on ${PORT}`));
