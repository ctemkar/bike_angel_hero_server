/* jshint esversion:8*/



const fs = require('fs');
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
// ...

express()
  .use(express.static(path.join(__dirname, 'public')))
  .use('/static', express.static('public'))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .get('/getcombo', async (req, res) => {
    let getcombo = await require('./public/get_combos_html.js');
    res.send(getcombo);
  })
  .get('/getappcombos', async (req, res) => {
    let getcombo = await require('./public/get_app_combos');
    res.send(getcombo);
  })

  .listen(PORT, () => console.log(`Listening on ${PORT}`));
