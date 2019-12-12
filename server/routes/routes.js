const express = require('express')

const Document = require('../models/Document')
const router = express.Router();
const _ = require('lodash');
var cron = require('node-cron');
const multer = require('multer');


var ObjectID = require('mongodb').ObjectID;
cron.schedule('* * * * *', async () => {

});

async function transactionScheduler(req, res) {
  const account = req.app.locals.db.collection("accounts");
  const transaction = req.app.locals.db.collection('transactions')
  const response = await transaction.find().toArray();

  response.forEach(async (value, key) => {

    if (value.transaction === "debit" && value.transaction_status === 'pending') {
      try {
        const accountTransaction = await account.updateOne({ 'accounts_id': value.accounts_id }, { $inc: { account_balance: -(value.transaction_amount -  value.transaction_charge) } }, { upsert: true });

        const updateTransaction = await transaction.updateOne({ transaction_id: value.transaction_id }, { $set: { transaction_status: "success" } }, { upsert: true })

        console.log('update')
      } catch (error) {

      }
    }
    if (value.transaction === "credit" && value.transaction_status === 'pending') {
      try {
        const accountTransaction = await account.updateOne({ 'accounts_id': value.accounts_id }, { $inc: { account_balance: (value.transaction_amount - value.transaction_charge) } }, { upsert: true });

        const updateTransaction = await transaction.updateOne({ transaction_id: value.transaction_id }, { $set: { transaction_status: "success" } }, { upsert: true })

        console.log('update')
      } catch (error) {

      }
    }

  })


}


router.get("/scheduler", async (req, res) => {

  await transactionScheduler(req, res);

  res.send('done')

});

router.get("/account-update/:accountid", async (req, res) => {

  const account = req.app.locals.db.collection("accounts");

  try {

    const response = await account.updateOne({ 'accounts_id': req.params.accountid }, { $set: { "account_balance": 100 } }, { upsert: true })

    const responses = await account.findOne({ 'accounts_id': req.params.accountid });
    console.log(responses);
    res.status(200).send(responses)
  } catch (error) {
    res.status(400).send({ 'error': error })
  }

});

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
    if (result === undefined || result.length === 0) {
      res.status(400).send({ 'error': 'No User in database' })
    } else {
      res.status(200).send(result)
    }
  })
})

router.delete('/customer/:accountid', async (req, res) => {

  try {
    const deleteUser = await req.app.locals.db.collection("customerInformation").deleteOne({ accounts_id: req.params.accountid });
    const deleteTransactions = await req.app.locals.db.collection('transactions').deleteMany({ accounts_id: req.params.accountid });
    const deleteFixedDeposit = await req.app.locals.db.collection('fixedDeposit').deleteMany({ accounts_id: req.params.accountid });
    const deleteAccount = await req.app.locals.db.collection('accounts').deleteOne({ accounts_id: req.params.accountid });
    res.status(200).send({ message: "User Delete successfully" })
  } catch (error) {
    res.status(500).send({ message: "Internal Server Error" })
  }
})

router.post("/access", async (req, res) => {
  const requestDb = req.app.locals.db.collection("customerInformation");
  try {
    const response = await requestDb.findOne({ email_address: req.body.email_address, password: req.body.password });
    if (response) {
      res.status(200).send(response)
    } else {
      res.status(400).send({ message: "No user found" })
    }
  } catch (error) {
    res.status(400).send(error);
  }
});
router.post('/customer', async (req, res) => {
  const requestDb = req.app.locals.db.collection("customerInformation");

  try {
    const findUser = await requestDb.find({ email_address: req.body.email_address }).toArray();

    if (findUser.length === 0) {

      const account = new ObjectID();
      const body = {
        "user_fname": req.body.user_fname,
        "user_lname": req.body.user_lname,
        "role": req.body.role,
        "accounts_id": account.toHexString(),
        "mobile_number": req.body.mobile_number,
        "email_address": req.body.email_address,
        "secondary_number": req.body.secondary_number,
        "address": req.body.address,
        "password": req.body.password
      };
      const registerUser = await requestDb.insertOne(body);
      res.status(200).send({ message: "User created successfully" })
    } else {
      res.status(500).send({ message: "Email id already registered" })
    }

  } catch (error) {
    res.status(400).send({ 'error': error })
  }

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

router.get('/customer/:accountid/accounts', function (req, res) {

  req.app.locals.db.collection('accounts').find({ accounts_id: req.params.accountid }).toArray((err, result) => {

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

router.post('/fixed-deposit', async (req, res) => {
  const requestDb = req.app.locals.db.collection('fixedDeposit');

  try {
    const body = {
      "accounts_id": req.body.accounts_id,
      "amount": req.body.amount,
      "interest": req.body.interest,
      "startDate": req.body.startDate,
      "endate": req.body.endate,
      "fixedDeposit_status": "pending"
    }
    const deposit = await requestDb.insertOne(body);
    res.status(200).send({ message: "fixed deposit created successfully" })

  } catch (error) {
    res.status(400).send({ 'error': error })
  }

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

router.post('/account', async (req, res) => {
  const requestDb = req.app.locals.db.collection('accounts');
  const BANK_ACCOUNT = 80000000;
  try {
    const accounts = await requestDb.find({ accounts_id: req.body.accounts_id }).toArray();
    if (accounts.length > 0) {
      res.status(400).send({ 'message': "Account already opened" });
    } else {
      const accountsLength = await requestDb.countDocuments();
      const accountNumber = BANK_ACCOUNT + accountsLength + 1;
      const date = new Date();
      const currentDate = date.toString();
      const body = {
        "account_number": `${accountNumber}`,
        "accounts_id": req.body.accounts_id,
        "branch_ID": req.body.branch_ID,
        "account_type": req.body.account_type,
        "account_balance": req.body.account_balance,
        "account_creation": currentDate,
        "account_charges": req.body.account_charges,
        "primary_holder": req.body.primary_holder
      }
      const accountCreated = await requestDb.insertOne(body);
      res.status(200).send({ message: "Account created successfully" })

    }
  } catch (error) {
    res.status(400).send({ 'error': error })
  }
})

router.get('/customer/:accountid/user-summary', async (req, res) => {
  const account = req.app.locals.db.collection('customerInformation');
  try {
    const response = await account.aggregate([
      { "$match": { "accounts_id": req.params.accountid } },
      {
        $lookup: {
          from: "accounts",
          localField: "accounts_id",
          foreignField: "accounts_id",
          as: "account"
        }
      },
      {
        $lookup: {
          from: "transactions",
          localField: "accounts_id",
          foreignField: "accounts_id",
          as: "transactions"
        }
      },{
        $lookup: {
          from: "fixedDeposit",
          localField: "accounts_id",
          foreignField: "accounts_id",
          as: "fixedDeposit"
        }
      },
      {
        $lookup: {
          from: "fundsTransfer",
          localField: "accounts_id",
          foreignField: "accounts_id",
          as: "fundsTransfer"
        }
      }
    ]).toArray();

    res.status(200).send(response);
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

router.post('/transactions', async (req, res) => {
  const requestDb = req.app.locals.db.collection('transactions');

  try {
    const account = new ObjectID();
    const date = new Date();
      const currentDate = date.toString();
    const body = {
      "accounts_id": req.body.accounts_id,
      "transaction": req.body.transaction,
      "transaction_amount": req.body.transaction_amount,
      "transaction_date": currentDate,
      "transaction_charge": req.body.transaction_charge,
      "transaction_id": account.toHexString(),
      "transaction_status": "pending"
    }
    const deposit = await requestDb.insertOne(body);
    res.status(200).send({ message: "fixed deposit created successfully" })

  } catch (error) {
    res.status(400).send({ 'error': error })
  }
})


router.get('/fundstransfer', async (req, res, next) => {
  const empdb = req.app.locals.db.collection('fundsTransfer');
  try {
    
    const response = await empdb.find().toArray();
    if (result === undefined || result.length === 0) {
      res.status(500).send({ 'error': 'No Funds transfere in database' })
    } else {
      res.status(200).send(response);
    }
  
  } catch (error) {
    res.status(200).send(error);
  }
})

router.post('/fundstransfer', async (req, res) => {
  const requestDb = req.app.locals.db.collection('fundsTransfer');

  try {
    const account = new ObjectID();
    const date = new Date();
    const currentDate = date.toString();
    const body = {
      "accounts_id": req.body.accounts_id,
      "transfer_amount": +req.body.transfere_ammount,
      "transfer_date": currentDate,
      "to_account": req.body.to_account,
      "from_account": req.body.from_account,
      "fundTransfere_status": 'pending',
      "fundTransfere_id": account.toHexString(),
    }
    const deposit = await requestDb.insertOne(body);
    res.status(200).send({ message: "fixed deposit created successfully" })

  } catch (error) {
    res.status(400).send({ 'error': error })
  }
})



router.get('/customer/:accountid/fundstransfer', function (req, res) {

  req.app.locals.db.collection('fundsTransfer').find({ accounts_id: req.params.accountid }).toArray((err, result) => {

    if (err) {
      res.status(400).send({ 'error': err })
    }
    if (result === undefined || result.length === 0) {
      res.status(400).send({ 'error': 'No data in database' })
    } else {
      res.status(200).send(result)
    }
  })
})

router.get('/search-engine', async (req, res, next) => {
  const empdb = req.app.locals.db.collection('customerInformation');
  try {
    const index = await empdb.createIndex({ "$**": "text" });
    const response = await empdb.find({ $text: { $search: req.query.q } }).toArray();
    console.log(response);
    res.status(200).send(response);
  } catch (error) {
    res.status(200).send(error);
  }

})

router.get('/search', async (req, res, next) => {
  String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }
  const query = Object.keys(req.query)[0];
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
      response = await customerInformation.find({ account_number: { $regex: new RegExp('^' + req.query.account_number) } }).toArray();
      break;
    default:
      break;
  }

  if (response === undefined || response.length === 0) {
    res.status(400).send({ 'error': 'No User  in database' })
  } else {
    for (let index = 0; index < response.length; index++) {
      const emp = await empdb.find({ accounts_id: response[index].accounts_id }).toArray();
      response[index].customerInfo = emp;
    }
    res.status(200).send(response);
  }
})


module.exports = router

