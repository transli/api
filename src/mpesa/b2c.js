const axios = require('axios');
const securityCredential = require('./security');

const CONSUMER_KEY = process.env.B2C_KEY; 
const CONSUMER_SECRET = process.env.B2C_SECRET; 
const BASE_URL = process.env.MPESA_BASE_URL; 

const request = async function () {
  const auth = Buffer.from(CONSUMER_KEY + ':' + CONSUMER_SECRET).toString('base64');
  const tokenData = await axios.get(BASE_URL+ '/oauth/v1/generate?grant_type=client_credentials', {
    headers: {
      'Authorization': 'Basic '+ auth,
      'content-type': 'application/json',
    },
  });

  return axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
      'Authorization': 'Bearer '+ tokenData.data['access_token'],
      'Content-Type': 'application/json'
    },
  });
};
 
module.exports = async (amount, partyB, remarks, occasion) => {
    const _shortCode = process.env.B2C_SHORT_CODE;
    const _initName = process.env.INITIATOR_NAME;
    const req =  await request();
    const _securityCredential = securityCredential();
    return req.post('/mpesa/b2c/v1/paymentrequest', {
      "InitiatorName": _initName,
      "SecurityCredential": _securityCredential,
      "CommandID": "BusinessPayment",
      "Amount": parseInt(amount),
      "PartyA": parseInt(_shortCode),
      "PartyB": partyB,
      "Remarks": remarks,
      "QueueTimeOutURL": "https://ena59nhek5g1.x.pipedream.net",
      "ResultURL": "https://ena59nhek5g1.x.pipedream.net/",
      "Occasion": occasion,
    });
  };
  
