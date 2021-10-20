/* jshint esversion:11*/


const fs = import('fs');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
// var getcombo = require('./public/get_citibike_data.js');
// console.log("GetCombo: " + getcombo);

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use('/static', express.static('public'))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/getcombo', async (req, res) => {
    try {
      let getcombo = await import('./public/get_combos.js');
      console.log(getcombo);
      res.send(getcombo);
    } catch (error) {
      console.error(error);
    }
  })


  //fs.createReadStream('get_citibike_data.js').pipe(res))
  // .use('/getcombo', getcombo)

  .listen(PORT, () => console.log(`Listening on ${PORT}`));
