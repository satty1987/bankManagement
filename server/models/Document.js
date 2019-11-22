module.exports = class Document {
  constructor(title, username, body) {
    this.title = title
    this.username = username
    this.body = body
  }
}

// // const model = {
// //   user_id: auto,
// //   user_fname: "Mark",
// //   user_lname: "Smith",
// //   city: "San Francisco",
// //   role: "user|admin",
// //   mobile_number: '9088',
// //   email_address: '',
// //   secondary_number: '',
// //   accounts: [{
//     account_number: auto,
//     accounts_id: auto,
//     branch_ID: 200,
//     account_type: "Checking|saving|Current",
//     account_balance: 567890,
//     account_creation: timestamp,
//     account_charges: '',
//     primary_holder : 'user_id',
//     customers: [user_id, user_id]
// //   }],
// //   transaction: [{
// //     accounts_id: 1,
// //     transaction: Debit / Credit,
// //     transaction_amount: 500,
// //     transaction_date: timestamp,
// //     transaction_charge: 5,
// //     transaction_id: '',
// //     transaction_status: ''
// //   }],
// //   fixedDeposit: [{
// //     accounts_id: 1,
// //     amount: 7890,
// //     interest: '5%',
// //     startDate: timestamp,
// //     endate: timestamp,
// //     fixedDeposit_status: ''
// //   }],
// //   fundTransfere: [{
// //     accounts_id: 1,
// //     amount: 7890,
// //     date: stamp,
// //     to_account: 13,
// //     from_account: '',
// //     fundTransfere_status: '',
// //     fundTransfere_id: ''
// //   }],
// //   bankBranches : [{
// //     branch_code : '',
// //     branch_address: '',
// //     branch_ifsccode: ''
// //   }]
// // }

// const temp = []
// for(var i=0;i<data.length;i++){

//   for(var j=0;j<data[i].transaction.length;j++){

//     temp.push(data[i].transaction[j])
//   }

//   }