const sendPush = (ctx, tokens, msg, options) =>{
  ctx.admin.messaging().sendToDevice(tokens, msg, options)
    .then(resp =>{
    console.log("Success", resp)
    })
    .catch(err=>{
      console.error("An error occured while sending meesage", err)
  });
}

module.exports = {
  sendPush
}