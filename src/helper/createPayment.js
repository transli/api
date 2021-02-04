module.exports = async(models, data)=>{
  try {
     const res = await models.Payment.create(data);
  } catch (err) {
  console.log(err)  
  }
}