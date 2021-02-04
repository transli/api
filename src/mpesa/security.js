const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const password = process.env.INITIATOR_PASS;
module.exports = () => {
  const bufferToEncrypt = Buffer.from(password);
  const data = fs.readFileSync(path.resolve('keys/certpublickey.cer'));
  const privateKey = String(data);
  const encrypted = crypto.publicEncrypt({
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_PADDING
  }, bufferToEncrypt);

  const securityCredential = encrypted.toString('base64');
  return securityCredential;
};
