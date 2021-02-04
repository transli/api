const AfricasTalking = require('africastalking');

const options = {
  apiKey: process.env.AFRICASTALKING_API_KEY, 
  username: 'sandbox'
};
module.exports = AfricasTalking(options);
