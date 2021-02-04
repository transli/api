const express = require('express');

const models = require('../../models');
const {createPayment} = require('../../helper');
const router = express.Router();

router.post('/ipn', (req, res) => {
  const{stkCallback} = req.body.Body;
  if ( stkCallback.ResultCode === 0 ) {
    const paymentData= {
      paymentType: 'mPesa',
      mpesaReceiptNumber: stkCallback.CallbackMetadata.Item[1].Value,
      amount: stkCallback.CallbackMetadata.Item[0].Value,
      phoneNumber: stkCallback.CallbackMetadata.Item[4].Value,
      transactionDate: stkCallback.CallbackMetadata.Item[3].Value,
      merchantRequestID: stkCallback.MerchantRequestID,
      checkoutRequestID: stkCallback.CheckoutRequestID,
      status: true
    }
    //console.log(paymentData)
    createPayment(models, paymentData);
  }else{
    const paymentData= {
      paymentType: 'mPesa',
      amount: 0,
      merchantRequestID: stkCallback.MerchantRequestID,
      checkoutRequestID: stkCallback.CheckoutRequestID,
      status: false
    }
    createPayment(models, paymentData);
  }
  const message = {
    "ResultCode": "0",
    "ResultDesc": "success"
  };
  res.json(message);
});

module.exports = router;
