// const Queue = require('../lib/Queue');
const db = require('../models');
const {admin} = require('../pushFCM/pushNofication');

module.exports = async function() {
  const dr_v = await db.Car.findAll({
    include: [
      {
        model: db.User,
        attributes: ['phone', 'email', 'deviceId', 'firstname'],
      }
    ],
    limit: 500,
  });

  let dv_ids = [];

  for (let i = 0; i < dr_v.length; i++) {
    const d = dr_v[i];
    const dv_id = d.User.deviceId;
    dv_ids.push(dv_id);
  }

  const tokens = dv_ids.filter(Boolean);
  const uniqueTokens = [...new Set(tokens)];
  admin.messaging().sendToDevice(uniqueTokens, {notification: {
    body: 'Hi 👋 driver, Offer a ride to passengers going your way this week! and earn some extra cash 💸!!',
    // imageUrl: undefined,
    title: 'Translite Car-Sharing'
  }}, {
    priority: "high",
    contentAvailable: true,
    timeToLive: 604800, // one week
  })
    .then(resp =>{
    console.log("Success", resp)
    })
    .catch(err=>{
      console.error("An error occured while sending meesage", err)
  });
};

// module.exports = async function testCrone() {
//   await Queue.add(SendNotificationEmail.key, {...testMesg});
// };
