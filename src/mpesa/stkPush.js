const {request} = require('./request');
module.exports = async (senderMsisdn, amount, accountRef) => {
    const timeStamp = (new Date()).toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const _shortCode = process.env.SHORT_CODE;
    const PASS_KEY = process.env.PASS_KEY;
    const password =  Buffer.from(`${_shortCode}${PASS_KEY}${timeStamp}`).toString('base64');
    const req =  await request();
    const callBackUrl = `https://www.translite.online/api/rest/translite/ipn`; 

    return req.post('/mpesa/stkpush/v1/processrequest', {
      'BusinessShortCode': _shortCode,
      'Password': password,
      'Timestamp': timeStamp,
      'TransactionType': 'CustomerPayBillOnline',
      'Amount': amount,
      'PartyA': senderMsisdn,
      'PartyB': _shortCode,
      'PhoneNumber': senderMsisdn,
      'CallBackURL': callBackUrl,
      'AccountReference': accountRef,
      'TransactionDesc': 'Lipa na mpesa'
    });
  };
  
