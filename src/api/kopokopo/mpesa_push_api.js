const express = require('express');
const crypto = require('crypto');
const moment = require('moment');

const {createPayment} = require('../../helper');
const models = require('../../models');
const router = express.Router();

router.post('/payment', (req, res, next) => {
 
  const service_name = req.body.service_name;
  const business_number = req.body.business_number;
  const transaction_reference = req.body.transaction_reference;
  const internal_transaction_id = req.body.internal_transaction_id;
  const transaction_timestamp = req.body.transaction_timestamp;
  const transaction_type = req.body.transaction_type;
  const account_number = req.body.account_number;
  const sender_phone = req.body.sender_phone;
  const first_name = req.body.first_name;
  const last_name = req.body.last_name;
  const middle_name = req.body.middle_name;
  const amount = req.body.amount;
  const currency = req.body.currency; 
  const signature = req.body.signature;

  const base_string = 
    "account_number="+account_number+
    "&amount="+amount+
    "&business_number="+business_number+
    "&currency="+currency+
    "&first_name="+first_name+
    "&internal_transaction_id="+internal_transaction_id+
    "&last_name="+last_name+
    "&middle_name="+middle_name+
    "&sender_phone="+sender_phone+
    "&service_name="+service_name+
    "&transaction_reference="+transaction_reference+
    "&transaction_timestamp="+transaction_timestamp+
    "&transaction_type="+transaction_type;

  const symmetric_key = process.env.KOPOKOPO_API_KEY;

  const created_signature = crypto.createHmac('sha1', symmetric_key)
  .update(base_string)
  .digest('base64');
  if(created_signature === signature){
    // Save payment to database
    const data = {
      paymentType: `${service_name}-KOPOKOPO`,
      mpesaReceiptNumber: `${transaction_reference}`,
      amount: parseInt(amount),
      phoneNumber: `${sender_phone}`,
      transactionDate: moment(transaction_timestamp).tz('Africa/Nairobi').format() ,
      merchantRequestID: `${account_number}`,
      checkoutRequestID: `${account_number}`,
      status: false
    }
    console.log(data.transactionDate)
    createPayment(models, data);
  }
  res.json({
    subscriber_message: `Thank you ${first_name} ${last_name} for your payment of ${currency} ${amount}, We value your business.`,
    status: '01',
    description: 'Accepted',
  });

});

module.exports = router;
