const express = require('express')
const os =  require('os')
var request = require('request');

const port = 8001
const app = express()

app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});
app.use((req, res, next) => {
  console.log(new Date(), req.url, req.method)
  next();
});
app.use(express.urlencoded({extended:false}));
app.use(express.static('client'))

app.get('/', require('./page/page-home').render)
app.get('/analyse/:product', require('./page/page-analyse-product').render)

const expressServer = app.listen(port, () => {
  console.log(`${new Date()} tradr listening on port ${port}`)
})
