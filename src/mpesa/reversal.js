const securityCredential = require('./security');
const {request} = require('./request');
 
module.exports = async () => {

    const _shortCode = process.env.SHORT_CODE;

    const req =  await request();

    const _securityCredential = securityCredential();

    return req.post('/mpesa/reversal/v1/request', {
      "Initiator":"BIZZJOHN",
      "SecurityCredential": _securityCredential,
      "CommandID":"TransactionReversal",
      "TransactionID": "OIC4HPUX0E",
      "Amount": 1,
      "ReceiverParty": _shortCode,
      "RecieverIdentifierType": "11",
      "Remarks": "Refund the transaction",
      "QueueTimeOutURL": "https://www.translite.online/api/rest/translite/ipn",
      "ResultURL": "https://www.translite.online/api/rest/translite/ipn",
      "Occasion": " "
    });
  };
  
