'use strict';
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    paymentType: DataTypes.STRING,
    mpesaReceiptNumber: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    phoneNumber: DataTypes.STRING,
    transactionDate: DataTypes.STRING,
    merchantRequestID: DataTypes.STRING,
    checkoutRequestID: DataTypes.STRING,
    status: DataTypes.BOOLEAN
  }, {});
  Payment.associate = function(models) {
    // associations can be defined here
  };
  return Payment;
};