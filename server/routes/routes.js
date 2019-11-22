const express = require('express')

const Document = require('../models/Document')
const router = express.Router();
const _ = require('lodash');
var cron = require('node-cron');
const multer = require('multer');

var ObjectID = require('mongodb').ObjectID;

router.get('/branches', (req, res, next) => {
  var mysort = { branch_code: 1 };
  const bankBranches = req.app.locals.db.collection("bankBranches");
  bankBranches.find().sort(mysort).toArray((err, result) => {
    if (err) {
      res.status(400).send({ 'error': err })
    }
    if (result === undefined || result.length === 0) {
      res.status(400).send({ 'error': 'No User in database' })
    } else {
      res.status(200).send(result)
    }
  })
})


router.get('/customer', (req, res, next) => {
  var mysort = { index: 1 };
  const employeeDb = req.app.locals.db.collection("customerInformation");
  employeeDb.find().sort(mysort).toArray((err, result) => {
    if (err) {
      res.status(400).send({ 'error': err })
    }
    if (result === undefined || result.length === 0) {
      res.status(400).send({ 'error': 'No User in database' })
    } else {
      res.status(200).send(result)
    }
  })
})
router.get('/customer/:accountid', function (req, res) {

  req.app.locals.db.collection('customerInformation').find({ accounts_id: req.params.accountid }).toArray((err, result) => {

    if (err) {
      res.status(400).send({ 'error': err })
    }
    //  result = _.filter(result, (item) => {
    //     return _.includes(_.toString(item.sapId),req.params.id);
    //   })


    if (result === undefined || result.length === 0) {
      res.status(400).send({ 'error': 'No User in database' })
    } else {
      res.status(200).send(result)
    }
  })
})

router.get('/customer/:accountid/transactions', function (req, res) {

  req.app.locals.db.collection('transactions').find({ accounts_id: req.params.accountid }).toArray((err, result) => {

    if (err) {
      res.status(400).send({ 'error': err })
    }
    if (result === undefined || result.length === 0) {
      res.status(400).send({ 'error': 'No User in database' })
    } else {
      res.status(200).send(result)
    }
  })
})

router.get('/customer/:accountid/fixed-deposit', function (req, res) {

  req.app.locals.db.collection('fixedDeposit').find({ accounts_id: req.params.accountid }).toArray((err, result) => {

    if (err) {
      res.status(400).send({ 'error': err })
    }
    if (result === undefined || result.length === 0) {
      res.status(400).send({ 'error': 'No User in database' })
    } else {
      res.status(200).send(result)
    }
  })
})

router.get('/fixed-deposit', function (req, res) {

  req.app.locals.db.collection('fixedDeposit').find().toArray((err, result) => {

    if (err) {
      res.status(400).send({ 'error': err })
    }
    if (result === undefined || result.length === 0) {
      res.status(400).send({ 'error': 'No User in database' })
    } else {
      res.status(200).send(result)
    }
  })
})

router.get('/accounts', function (req, res) {

  req.app.locals.db.collection('accounts').find().toArray((err, result) => {

    if (err) {
      res.status(400).send({ 'error': err })
    }
    if (result === undefined || result.length === 0) {
      res.status(400).send({ 'error': 'No User in database' })
    } else {
      res.status(200).send(result)
    }
  })
})

router.get('/customer/:accountid/user-summary', async (req, res) => {

  try {

    const account = req.app.locals.db.collection('accounts');

    const accountInfo = await account.find({ accounts_id: req.params.accountid }).toArray();

    const fd = await req.app.locals.db.collection('fixedDeposit').find({ accounts_id: req.params.accountid }).toArray();

    const transactions = await req.app.locals.db.collection('transactions').find({ accounts_id: req.params.accountid }).toArray();
    const custInfo = await req.app.locals.db.collection('customerInformation').find({ accounts_id: req.params.accountid }).toArray();
  
     const response = {
      accountInfo: accountInfo,
      fixedDeposit : fd,
      transactions : transactions,
      customer : custInfo
     }
     if (response) {
      res.status(200).send(response);
    
    } else {
      res.status(400).send({ 'error': 'No User in database' })
    }

  } catch (error) {
    res.status(400).send({ 'error': error })
  }

})

router.get('/transactions', function (req, res) {

  req.app.locals.db.collection('transactions').find().toArray((err, result) => {

    if (err) {
      res.status(400).send({ 'error': err })
    }
    if (result === undefined || result.length === 0) {
      res.status(400).send({ 'error': 'No User in database' })
    } else {
      res.status(200).send(result)
    }
  })
})

router.get('/search', async (req, res, next) => {
  String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}
  const query = Object.keys(req.query )[0];
  const customerInformation = req.app.locals.db.collection('accounts');
  const empdb = req.app.locals.db.collection('customerInformation');
  
  let response = '';
  switch (query) {
    case 'accounts_id':
      response = await customerInformation.find({ accounts_id: req.query.accounts_id }).toArray();
      break;
    case 'name':
      response = await customerInformation.find({ primary_holder: { $regex: new RegExp('^' + req.query.name.capitalize()) } }).toArray();
      break;
    case 'account_number':


      response = await customerInformation .find({ account_number: { $regex: new RegExp('^'+req.query.account_number) } }).toArray();

     // response = await customerInformation.find({ accounts_id: account_response.accounts_id }).toArray();

      break;
    default:
      break;
  }
  


  if (response === undefined || response.length === 0) {
        res.status(400).send({ 'error': 'No User  in database' })
      } else {
        for (let index = 0; index < response.length; index++) {
          const emp =  await empdb.find({ accounts_id: response[index].accounts_id }).toArray();
            response[index].customerInfo = emp;
          }
        res.status(200).send(response);
      }
    

})


// var storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'uploads/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname)
//   }
// })

// var upload = multer({ storage: storage, limits: { fileSize: 1024 * 1024 * 5 } })
// var type = upload.single('file');


// router.post('/uploadfile', type, (req, res, next) => {
//   const file = req.file;
//   console.log(file);
//   if (!file) {
//     const error = new Error('Please upload a file')
//     error.httpStatusCode = 400
//     return next(error)
//   }
//   res.send(file)

// })


// // var request = require("request");
// // const OktaJwtVerifier = require('@okta/jwt-verifier');

// // const oktaJwtVerifier = new OktaJwtVerifier({
// //   issuer: 'https://dev-337333.oktapreview.com/oauth2/default', // required
// //   clientId: '0oafkl686pfl21cP10h7'
// // });

// router.get('/scheduler', async (req, res, next) => {

//   var authColl = await req.app.locals.db.collection("employee").find({}).toArray();
//   var emp = await req.app.locals.db.collection("parking").find({}).toArray();

//   var merge = [...authColl, ...emp];
//   // cron.schedule('* * * * * *', () => {
//   //   console.log('running a task every minute');
//   // });
//   res.status(400).send({ response: merge })
// })

// router.get('/parking', async (req, res, next) => {

//   const query = req.query.tower;
//   let response;
//   const parking = req.app.locals.db.collection("parking");

//   switch (query) {
//     case 'tower-1':
//       response = await parking.find({ towerName: "Tower-1" }).toArray();
//       break;

//     case 'tower-2':
//       response = await parking.find({ towerName: "Tower-2" }).toArray();
//       break;

//     case 'tower-3':
//       response = await parking.find({ towerName: "Tower-3" }).toArray();
//       break;

//     default:
//       response = await parking.find({}).toArray();
//       break;
//   }
//   if (response === undefined || response.length === 0) {
//     res.status(400).send({ 'error': 'No Parking in database' })
//   } else {

//     const availableParking = _.filter(response, { parking_Available: true });
//     const alocatedParking = _.filter(response, { parking_Available: false });

//     res.status(200).send({ totalParking: response.length, availableParking: availableParking.length, alocatedParking: alocatedParking.length, result: response })
//   }

// })

// router.get('/parkings', (req, res, next) => {

//   const parking = req.app.locals.db.collection("parking");
//   var pageNo = parseInt(req.query.pageNo);
//   var size = parseInt(req.query.size);
//   var query = {};
//   let response;
//   if (pageNo < 0 || pageNo === 0) {
//     response = { "error": true, "message": "invalid page number, should start with 1" };
//     return res.json(response)
//   }
//   query.skip = size * (pageNo - 1);
//   query.limit = size;
//   //const response = await parking.find({},{},query).toArray();
//   parking.find({}, {}, query, function (err, data) {
//     // Mongo command to fetch all data from collection.
//     if (err) {
//       response = { "error": true, "message": "Error fetching data" };
//     } else {
//       response = { "error": false, "message": data };
//     }

//   });

//   res.json(response);

// })

// router.get('/users', (req, res, next) => {
//   var mysort = { index: 1 };
//   const employeeDb = req.app.locals.db.collection("employee");
//   employeeDb.find().sort(mysort).toArray((err, result) => {


//     if (err) {
//       res.status(400).send({ 'error': err })
//     }
//     if (result === undefined || result.length === 0) {
//       res.status(400).send({ 'error': 'No User in database' })
//     } else {
//       res.status(200).send(result)
//     }
//   })
// })
// router.get('/users/:id', function (req, res) {

//   var mysort = { index: 1 };
//   req.app.locals.db.collection('employee').find({ sapId: +req.params.id }).sort(mysort).toArray((err, result) => {

//     if (err) {
//       res.status(400).send({ 'error': err })
//     }
//     //  result = _.filter(result, (item) => {
//     //     return _.includes(_.toString(item.sapId),req.params.id);
//     //   })


//     if (result === undefined || result.length === 0) {
//       res.status(400).send({ 'error': 'No User in database' })
//     } else {
//       res.status(200).send(result)
//     }
//   })
// })

// router.post('/raise-request', async (req, res, next) => {


//   const requestDb = req.app.locals.db.collection("parking-request");

//   const response = await requestDb.find({ employeeCode: req.body.employeeCode }).toArray();

//   if (response && response.length === 0) {
//     const body = {
//       "employeeCode": req.body.employeeCode,
//       "employeeBand": req.body.employeeBand,
//       "startDate": req.body.startDate,
//       "endDate": req.body.endDate,
//       "prefferTowerValue": req.body.prefferTowerValue,
//       "requestType": req.body.requestType,
//       "status": "pending"
//     };
//     requestDb.insertOne(body, (err, result) => {
//       if (err) {
//         res.status(400).send({ 'error': err })
//       }
//       res.status(200).send({ message: "Request created successfully" })
//     })
//   } else {
//     res.status(500).send({ message: "request already create" });
//   }



// })
// router.post('/surrender-request', (req, res, next) => {
//   console.log(req);
//   const newDocument = new Document(req.body.title, req.body.username, req.body.body)
//   req.app.locals.db.collection('documents').insertOne({
//     newDocument
//   }, (err, result) => {
//     if (err) {
//       res.status(400).send({ 'error': err })
//     }
//     res.status(200).send(result)
//   })
// }) 

// router.get('/surrender-request/:sapId', async (req, res, next) => {
//   try {
//     const parking = await req.app.locals.db.collection("parking").find({ alloted: { employeeCode: +req.params.sapId } }).toArray();
// console.log(parking);
//     if (parking && parking.length !== 0) {
//       res.status(200).send({ surrender: true });

//     } else {
//       res.status(200).send({ surrender: false });
//     }

//   } catch (error) {
//     res.status(200).send({ error: error });
//   }

// })

// router.delete('/raise-request/:id', (req, res, next) => {

//   const requestDb = req.app.locals.db.collection("parking-request");

//   requestDb.deleteOne({
//     '_id': ObjectID(req.params.id)
//   }, (err, result) => {
//     if (err) {
//       res.status(400).send({ 'error': err })
//     }
//     res.status(200).send(result)
//   })
// })

// router.put('/raise-request', async (req, res, next) => {
//   const requestDb = req.app.locals.db.collection("parking-request");

//   const employee = req.app.locals.db.collection("employee");
//   const parking = req.app.locals.db.collection("parking");
//   const parkingSlot = {
//     'tower_1': 'Tower-1',
//     'tower_2': 'Tower-2',
//     'tower_3': 'Tower-3'
//   };
//   let response = await parking.find({ towerName: parkingSlot[req.body.prefferTowerValue], parking_Available: true }).toArray();

//   if (response.length <= 0) {
//     return res.status(500).send({ 'error': 'Parking not available' })
//   }

//   requestDb.updateOne({ '_id': ObjectID(req.body._id) },
//     { $set: { "status": 'approved' } }, { upsert: true }, (err, result) => {
//       if (err) {
//         // res.status(400).send({ 'error': err })
//       } else {
//         employee.updateOne({ 'sapId': +req.body.employeeCode },
//           { $set: { "parkingAvail": 'true' } }, { upsert: true }, (err, result) => {
//             if (err) {
//               res.status(400).send({ 'error': err })
//             } else {
//               parking.updateOne({ 'puid': response[0].puid},
//                 { $set: { "parking_Available": false, 'alloted' : req.body  } }, { upsert: true }, (err, result) => {

//                   res.status(200).send(result)
//                 });


//             }




//           })
//       }

//     })


// })
// router.get('/raise-request', async (req, res, next) => {

//   let response;
//   const parking = req.app.locals.db.collection("parking-request");
//   response = await parking.find().toArray();

//   res.status(200).send({ result: response })


// })

// router.get('/pull', async (req, res, next) => {
//   const parking = req.app.locals.db.collection("parking");

//   parking.find({alloted : {$exists : true }}).forEach(function(mydoc) {
//     console.log(mydoc);
//     parking.updateMany({_id: mydoc._id}, {$set: {"parking_Available": true}})
//   })
//   res.status(200).send({ result: 'done' })


// })
module.exports = router


  // // employeeDb.updateMany(
  // //   {},
  // //   { $set: {"employee_band": employeeBands[Math.floor(Math.random() * 10)]} },
  // //   false,
  // //   true
  // // )
  // employeeDb.find({employee_band: {$exists : true }}).forEach(function(mydoc) {
  //   console.log(mydoc);
  //   employeeDb.updateMany({_id: mydoc._id}, {$set: {"employee_band": employeeBands[Math.floor(Math.random() * 10)]}})
  // })