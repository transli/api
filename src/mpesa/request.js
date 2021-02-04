const axios = require('axios');
const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET; 
const BASE_URL = process.env.MPESA_BASE_URL; 

const request = async function () {
  const auth = Buffer.from(CONSUMER_KEY + ':' + CONSUMER_SECRET).toString('base64');

  const tokenData = await axios.get(BASE_URL+ '/oauth/v1/generate?grant_type=client_credentials', {
    headers: {
      'Authorization': 'Basic '+ auth,
      'content-type': 'application/json',
    }
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
module.exports={
  request
}