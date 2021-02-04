const express = require('express');

const router = express.Router();

const payment = require('./kopokopo/mpesa_push_api');
const translite = require('./stkpush/callback');

router.get('/', (req, res) => {
  res.json({
    message: 'oky',
  });
});

router.use('/kopokopo', payment);
router.use('/translite', translite);

module.exports = router;
