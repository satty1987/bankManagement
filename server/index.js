const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
var cors = require('cors')
const auth = {
  MONGO_INITDB_ROOT_USERNAME: 'admin',
  MONGO_INITDB_ROOT_PASSWORD: 'admin123'
}
const morgan = require('morgan');
const dbName = 'ds137801.mlab.com:37801/bankmanagement'
const url = `mongodb://${auth.MONGO_INITDB_ROOT_USERNAME}:${auth.MONGO_INITDB_ROOT_PASSWORD}@${dbName}`
const options = {
  useNewUrlParser: true, 
  reconnectTries: 60, 
  reconnectInterval: 1000,
  useUnifiedTopology: true
}
const routes = require('./routes/routes.js')
const port = process.env.PORT || 9000
const app = express()
const http = require('http').Server(app)
app.use(morgan('dev'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


app.use(cors());
//app.use(require('./auth'));
app.use('/api', routes)
app.use('/sql', routes)
app.use('/uploads', express.static('uploads'));

app.use((req, res) => {
  res.status(404).send({ message: 'Route'+req.url+' Not found.' });
})

MongoClient.connect(url, options, (err, database) => {
  if (err) {
    console.log(`FATAL MONGODB CONNECTION ERROR: ${err}:${err.stack}`)
    process.exit(1)
  }
  app.locals.db = database.db('bankmanagement')
  http.listen(port, () => {
    console.log("Listening on port " + port)
    app.emit('APP_STARTED')
  })
})


// const https = require('https');
// const jsonURL = "https://raw.githubusercontent.com/satty1987/ng-graphql/master/db1.json";

// MongoClient.connect(url, options,(error, database) => {

//   const db = database.db('bankmanagement')
//   if(error) return console.log(error);
//   https.get(jsonURL, (response) => {
//     console.log(jsonURL);
//     let body = '';
//     response.on('data', function(chunk) {
//       body += chunk;
//     });
//     response.on('end', function() {
//       let json = JSON.parse(body);
//       db.collection('accounts').insertMany(json, (error, result) => {
//         console.log(result);
       
//       });
//     });
//   })
// })

module.exports = app