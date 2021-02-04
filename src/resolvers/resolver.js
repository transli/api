const jwt = require('jsonwebtoken');
const { Op } = require("sequelize");
const GraphQLJSON = require('graphql-type-json');
const models = require('../models');
const { checkAuthAndResolve } = require('./authchecker');
const { getAllVehicles } = require('../store');
const { stkPush , b2c} = require('../mpesa');
const {pubsub, withFilter} = require('./pubsub/pubsub');
const {sendPush} = require('../pushFCM/sendPush');
const haversine = require('../util/haversine');
const cache = require('../cache/Cache');
const Queue = require('../lib/Queue');
const SendNotificationEmail = require('../helper/SendNotificationEmail');
const moment = require('moment');

moment.locale('en-gb');
const FORMAT = 'YYYY-MM-DD HH:mm:ss';

const formatErrors = (e, models) => {
  if (e instanceof models.sequelize.ValidationError) {
    return e.errors.map(x => _.pick(x, ['path', 'message']));
  }
  return [{ path: 'name', message: 'something went wrong' }];
};

async function findUserById(id) {
  const {dataValues: me} = await models.User.findByPk(id, {
    attributes: ['phone', 'email', 'deviceId', 'firstname', 'id', 'avatorUrl'],
   });
   return me;
};

async function findLiftById(id) {
  const {dataValues: lift} = await models.Trip.findByPk(id, {
    attributes: ['from', 'to', 'departure_time', 'id', 'amount_per_seat', 'seats'],
   });
   return lift;
};

const EVENTS = {
  ON__NEW_USER: `onNewuser`,
  ON__NEW_BOOKING: `onBooking`,
  ON__NEW_MESSAGE: `onNewmessage`,
  ON__NEW_CHAT: `onNewChat`,
};
const options = {
  priority: "high",
  timeToLive: 60 * 60 * 24
}

const _publish = (component, data) => {
  pubsub.publish(component, { [component]: data });
};

function randmString(length) {
  let result           = '';
  const characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';
  const charactersLength = characters.length;
  for ( let i = 0; i < length; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const PERCENT = 3.5 / 100;

const Check_Id = (db, id) =>{
  return db.count({ where: { vehicleId: id } })
    .then(count => {
      if (count != 0) {
        return false;
      }
      return true;
  });
}
const resolvers = {
  JSON: GraphQLJSON,
  //Queries
  Query: {
    getAllVehicles: async (__, { latitude, longitude }, context, _) => {
      const haversine_formula = haversine(context.models, latitude, longitude);
      try {
        const res = await context.models.Vehicle.findAll({
          attributes: {include: haversine_formula},
          include: [{
            all: true, 
            }],
            order: context.models.sequelize.col('distance'),
            limit: 60,
          // include: [
          //   {model: models.User},
          //   {model: models.Reviews},
          //   {model: models.Vehiclebooking},
          //   {model: models.VehicleImages},
          //   {model: models.BasicVehicleDetails},
          //   {model: models.VehicleGuideline},
          // ],
          // order: models.sequelize.col('distance'),
          // limit: 50,
        });
        return res;
      } catch (err) {
        console.log(err);
      }
    },
    vehicleById: async (__, {id}, context) => {
      try {
        const {dataValues} = await context.models.Vehicle.findOne({
          where: {
            'id': {
              [Op.eq]: id,
            }
          },
          include: [{
            all: true, 
            // nested: true,
            require: true,
          }],
        });
        return dataValues;
      } catch (err) {
        return{
          errors: formatErrors(err, context.models),
        }
      }
      
    },
    searchByLocation: async (__, args, context) => {
      try {
        return await getAllVehicles(context.models).then(data => {
          return data.filter(dt => dt.address.includes(args.l));
        });
      } catch (err) {
        console.log(err);
      }
    },

    me: async (__, args, context, _) => {
       const {data} = checkAuthAndResolve(context);
       const id = parseInt(data.id);
       const cache_key = `my-:${id}`;
       const cached = await cache.get(cache_key);
       if (cached) {
        return cached
       }
      try {
        const {dataValues} = await context.models.User.findByPk(id);
        cache.set(cache_key, dataValues, 12);
        return dataValues;
      } catch (err) {
        return{
          errors: formatErrors(err, context.models),
        }
      }
    },

    getUser: async (__, {id}, ctx, _) => {
      checkAuthAndResolve(ctx);
      let cache_key = `get_user_data_:${id}`;

      const cached_user = await cache.get(cache_key);

      if (cached_user) {
        return cached_user;
      }

      try {
        const {dataValues} = await ctx.models.User.findOne({
          where: {
            id: {
              [Op.eq]: id,
            }
          },
          include: [
            {model: ctx.models.Trip},
            {model: ctx.models.User_Rating},
            {model: models.Verified_document, require: true}
          ], 
        });
        await cache.set(cache_key, dataValues, 5);
        return dataValues;
      } catch (err) {
        console.log(err);
      }
    },
    
    userVehicles: async (__, obj, context, _) =>{
      const {data} = checkAuthAndResolve(context);
      try {
        return await context.models.Vehicle.findAll({
          where: {userId: data.id,},
          include: [models.User, models.VehicleImages],
          order: [
            ['id', 'DESC'],
          ],
        }); 
      } catch (err) {
        return{
          errors: formatErrors(err, context.models),
        }
      }
    },

    checkPayments: async(__, {crID, mrID}, context, _)=>{
      try {
        return await context.models.Payment.findOne({
          where: {
            checkoutRequestID: crID,
            merchantRequestID: mrID,
          }
        });
      } catch (err) {
        return{
          errors: formatErrors(err, context.models)
        }
      }
    },

    mpesaReceiptNumber: async(__, {mpesaCode}, context, _)=>{
      try {
        const resp = await context.models.Payment.findOne({
          where: {
            mpesaReceiptNumber: mpesaCode,
            status: {
              [Op.not] : true
            },
          },
        });
        await context.models.Payment.update({
          status: true,
        },{
            where: {mpesaReceiptNumber: mpesaCode},
            returning: true, 
            plain: true,
          });
        return resp;
      } catch (err) {
        console.log(err)
        return{
          errors: formatErrors(err, context.models),
        };
      };
    },

    bookingHistory: async(__, ___, context, _)=>{
      const {data} = checkAuthAndResolve(context);
      try {
        const res = await context.models.Vehiclebooking.findAll({
          where:{
            userId: data.id,
          },
          order: [
            ['id', 'DESC'],
          ],
          include: [
            {
              model: context.models.Cancelled_Booking, // left join
            },
            {
              model: context.models.Rejected_Booking, // left join
            }
          ],
        });
        return res;
      } catch (err) {
        console.log(err)
        return{
          errors: formatErrors(err, context.models)
        }
      }
    },
    bookingHistoryById: async(__, {id}, context, _) => {
      try {
        const res = await context.models.Vehiclebooking.findOne({
          where:{
            id: id,
          },
          include: [
            {
              model: context.models.Cancelled_Booking, // left join
            },
            {
              model: context.models.Rejected_Booking, // left join
            }
          ]
        });
        return res;
      } catch (err) {
        return{
          errors: formatErrors(err, context.models)
        }
      }
    },

    vehicleTrips: async(__, {id}, context, _) =>{
      try {
        const res = await context.models.Vehiclebooking.findAll({
          where:{
            vehicleId: id,
          },
          include: [{
            all: true, 
          }],
          order: [
            ['id', 'DESC'],
          ],
        });
        return res;
      } catch (err) {
        return{
          errors: formatErrors(err, context.models)
        }
      }
    },

    tripPricing: async (__, {price, days}, ctx, _) => {
      checkAuthAndResolve(ctx);
      const bookingFeepdy = Math.round(PERCENT * price); // 105
      const totalBookingFee = Math.round(bookingFeepdy * days); // 160
      const totalpdy = price + bookingFeepdy; // 3,105
      const total = Math.round(totalpdy * days); // 4720
      const payableAmount = total - totalBookingFee; //4560

      return{
        Totalpdy: totalpdy,
        Total: total,
        BookingFeepdy: bookingFeepdy,
        TotalBookingFee: totalBookingFee,
        PayableAmount: payableAmount,
      }

    },

    /**
     * Translite lifts query
     * query @name getAllLifts
     * @param
     * @args 
     * @models
     */
    getAllLifts: async (_, args, {models}, __) => {
      try {
        const _now = new Date(moment().tz('Africa/Nairobi').format(FORMAT)).toISOString();
        const new_date = new Date(moment().tz('Africa/Nairobi').add(21, 'days').format(FORMAT)).toISOString();
        const res = await models.Trip.findAll({
          where: {
            departure_time: {
              [Op.gte] : _now,
              [Op.lte] : new_date,
            },
          },
          include: [
            { model: models.Car, require: true },
            { 
              model: models.User, require: true,
              include: [
                {
                  model: models.User_Rating,
                  attributes: ['stars']
                },
              ],
            },
            { model: models.Location_point, require: true },
            { model: models.Trips_booking, require: true },
          ],
          order: [
            ['departure_time', 'ASC'],
          ],
        });
        return res;
      } catch (err) {
        console.log(err)
      };
    },
    offeredLiftById: async (__, {}, context) => {
      const {data} = checkAuthAndResolve(context);
      try {
      return await context.models.Trip.findAll({
          include: [
            { 
              model: models.Car,
               require: true 
            },
            {
               model: models.Trips_booking,
               require: true,
               include: [
                 {
                   model: models.User,
                   attributes: ['id', 'firstname', 'avatorUrl'],
                  },
               ],
            },
            {
               model: models.Location_point, 
               require: true 
            },
          ],
          where: {
            user_id: data.id,
          },
          order: [
            // ['id', 'DESC'],
            ['departure_time', 'ASC'],
          ],
        });
      } catch (err) {
        console.log(err);
      };
    },
    liftById: async (__, {liftId}, context) => {
      checkAuthAndResolve(context);
      try {
        const {dataValues} = await context.models.Trip.findOne({
          where: {
            id: liftId,
          },
          include: [
            { model: models.Car, require: true },
            { model: models.User, require: true,
              include: [
                {model: models.User_Rating, require: true},
              ],
             },
            { model: models.Location_point, require: true },
            { model: models.Trips_booking, require: true,
              include: [
                {model: models.User, require: true}
              ],
            },
          ],
        });

        const bookedRides = dataValues.Trips_bookings;
        const array = bookedRides.filter((el) => el.isCanceled !== true);
        let passangersOnBoard = []
        let p_seats = 0;

        for (let i = 0; i < array.length; i++) {
          const passangersIds = array[i].user_id;
          const _p = JSON.parse(array[i].seats);
          p_seats += _p.length;
          const passData = await context.models.User.findByPk(passangersIds);
          const pssNgerObj = {
            fullName: `${passData.firstname} ${passData.lastName}`,
            profileImg: passData.avatorUrl,
            seats: _p.length,
            phone: `${passData.phone}`,
            id: passData.id,
          };
          passangersOnBoard.push(pssNgerObj);
        };

        const r_data = {
          ...dataValues,
          bookedSeats: p_seats,
          passangers: passangersOnBoard,
        };
        return r_data;
      } catch (err) {
        return{errors: formatErrors(err, context.models),}
      }
    },
    getCarToOfferLift: async (__, args, context, _) => {
      const {data} = checkAuthAndResolve(context);

      let cache_key = `getCarToOfferLift:${data.id}`;
      const cached = await cache.get(cache_key);

      if (cached) {
        return cached;
      }

      try {
        const resp_data = await context.models.Car.findAll({
          where: {
            'user_id': {
              [Op.eq]: data.id,
            }
          },
          limit: 1,
        });
        // caching data
        await cache.set(cache_key, resp_data, 12);
        return resp_data;
      } catch (err) {
        console.log(err);
      }
    },

    myBookedLift: async (__, args, context, _) => {
      const {data} = checkAuthAndResolve(context); 
      try {
        const res = await context.models.Trips_booking.findAll({
          where: {
            'user_id': {
              [Op.eq]: data.id,
            },
            "trip_id": {
              [Op.ne]: null,
            }
          },
          include: [
            { model: models.Trip, require: false},
          ],
          order: [
            ['id', 'DESC'],
          ],
          limit: 15,
        });
        let tripData = [];
        for (let i = 0; i < res.length; i++) {
          const user_id = res[i].Trip.user_id;
          const _u = await context.models.User.findByPk(user_id);
          const _car = await context.models.Car.findOne({
            where: {
              'user_id': {
                [Op.eq]: user_id,
              },
            },
          });
          const trip_obj = {
            User: _u,
            Trips_booking: res[i],
            Car: _car,
          }
          tripData.push(trip_obj);
        }
        return tripData;
      } catch (err) {
        console.error(err.name, err.message)
      }
    },

    userReviews: async (__, {id}, ctx, _) => {
      try {
        const reviews = await ctx.models.User_Rating.findAll({
          where: {
            'to_user_id': {
              [Op.eq]: id,
            },
          },
          include: [
            {
              model: models.User,
              as: 'ratedBy',
              attributes: ['id', 'firstname', 'avatorUrl']
            }
          ],
          order: [
            ['id', 'DESC']
          ],
        });
        console.log(reviews);
        return reviews;
      } catch (err) {
        console.error(err);
        return{
          status: 0,
          message: err.message,
        }
      }
    },

    getNewLiftBookings: async (__, {}, ctx, _) => {
      const {data} = checkAuthAndResolve(ctx);
      const _now = new Date(moment().tz('Africa/Nairobi').format(FORMAT)).toISOString();
      try {
        return await ctx.models.Trips_booking.findAll({
          where: {
            [Op.and]: [
              {status: 'PEDDING'},
              {lift_owner_id: data.id},
            ],
          },
          include: [
            {
              model: ctx.models.Trip,
              where: {
                departure_time: {
                  [Op.gte] : _now,
                },
              }
            },
            {
              model: ctx.models.User, 
              require: true,
              include: [
                {
                  model: models.User_Rating,
                  attributes: ['stars'],
                },
              ],
            },
          ],
          limit: 1
        });
      } catch (err) {
        return{
          status: 0,
          message: err.message,
        }
      }
    },

    getMessagesList: async (__, {}, ctx, _) => {
      const {data} = checkAuthAndResolve(ctx);
      const currentUserId = data.id;
      let messagesData = [];
      const msgs_threads = await ctx.models.Messages_thread.findAll({
        where: {
          [Op.or]: [
            {sender: currentUserId},
            {receiver: currentUserId},
          ],
        },
        include: [
          {model: models.Trip},
        ],
        order: [
          ['id', 'DESC'],
        ],
        limit: 100,
      });
      for (let m = 0; m < msgs_threads.length; m++) {
        const _m = msgs_threads[m];
        const _s = _m.dataValues.sender;
        const _r = _m.dataValues.receiver;
        const _id = currentUserId === _s ? _r : _s;
        const {dataValues} = await models.User.findByPk(_id);
        const msgData = {
          ..._m.dataValues,
          _id: _id,
          User: dataValues,
        };
        messagesData.push(msgData);
      }
      
      return messagesData;
    },

    messageChat: async (__, { msg_thread_id }, ctx, _) => {
      checkAuthAndResolve(ctx);
      try {
        return await ctx.models.Message.findAll({
          where: {
            'msg_thread_id':{ 
              [Op.eq] : msg_thread_id,
            }
          },
          include: [models.User],
          order: [
            ['id', 'DESC'],
            // ['createdAt', 'DESC']
          ],
          limit: 100,
        });
      } catch (err) {
        console.log(err);
      }
    },

    getAppVersion: async (__, args, ctx, _) => {
      checkAuthAndResolve(ctx);
      try {
        return await ctx.models.App_version.findAll({
          order: [
            // ['id', 'DESC'],
            ['createdAt', 'DESC'],
          ],
          limit: 1,
        });
      } catch (err) {
        console.log(err);
      }
    },

  },


  // All Mutations
  Mutation: {
    createUser: async (__, { input }, context) => { 
      try { 
        const phone = input.phone;
        const newUserAdded = await context.models.User.findOrCreate({
          where: {phone},
          defaults: input
        });
        // generate token
        const token = jwt.sign({
          data: newUserAdded[0].dataValues
        }, process.env.JWT_SECRET_KEY, {
          expiresIn: '672h',
        });
        const _userAdded = newUserAdded[0].dataValues;
        _publish(EVENTS.ON__NEW_USER, _userAdded);
        return {
          user: _userAdded,
          token: token,
        };
      } catch (err) {
        throw err;
      }
    },

    addVerificatonDocs: async (__, {input}, ctx, _) => {
      checkAuthAndResolve(ctx);
      const {dataValues} = await ctx.models.Verified_document.create({...input});
      return {
        status: 200
      };
    },

    updateUser: async(__, { }, context) =>{
      try {
          return {
            success: true,
            message: "ok",
            status: 200
          };
      } catch (err) {
        return{errors: formatErrors(err, context.models),}
      }
    },

    listVehicle: async (__, {input}, context) => {
      const {data} = checkAuthAndResolve(context);
      const _dt = {
        ...input,
        userId: data.id,
      }
      try {
       const {dataValues} = await context.models.Vehicle.create({..._dt});
       const imgData = {
        imgUrl: input.imgUrl,
        vehicleId: dataValues.id
       }
       await context.models.VehicleImages.create(imgData);
        return {
          vehicle: dataValues,
          success: true,
          status: 200
        };
      } catch (err) {
        throw err;
      }
    },

    handleBooking: async (__, {bookingData}, context) => {
      const {data} = checkAuthAndResolve(context);
      const dt = {
        tripStart: bookingData.tripStart,
        mPesaNumber: bookingData.mPesaNumber,
        tripEnd: bookingData.tripEnd,
        days: bookingData.days,
        vehicleId: bookingData.vehicleData.id,
        ownerId: bookingData.vehicleData.User.id,
        picRetLo: bookingData.picRetLo,
        vehicleData: bookingData.vehicleData,
        userId: data.id,
        mpesaReceiptNumber: bookingData.mpesaReceiptNumber,
      }  
      const img = `${bookingData.vehicleData.VehicleImages[0].imgUrl}`;
      try {
        const resp = await context.models.Vehiclebooking.findOrCreate({
          where: { mpesaReceiptNumber: dt.mpesaReceiptNumber },
          defaults: dt
        });
         const newBooking = resp[0].dataValues;
        // _publish(EVENTS.ON__NEW_BOOKING, newBooking);
        const _notification = {
          notification: {
            "title": "New car Booking",
            "body": "Your car have been hired for, " + days + "Tap for more ....", //+ title,
            "image": img
          }
        };
        sendPush(context, bookingData.vehicleData.User.deviceId, _notification, options);
        // context.smsClient.SMS.send({
        //   to: '+254748370472', 
        //   message: "Hey You car have been hired for, " + days + " ",
        //   from: 'TRANSLITE'
        // });
        return{
          success: true,
          status: 200,
          vehicleBooked: newBooking
        }
      } catch (err) {
        console.log(err);
      }
    },

    createReview: async (__, {review}, context) => {
      const { data } = checkAuthAndResolve(context);
      const rvwData = {
        review: review.review,
        userId: data.id,
        vehiclebookingId: review.vehiclebookingId,
        rate: review.rate,
        VehicleId: review.vehicleId,
      }
      try {
        const resp = await context.models.Reviews.findOrCreate({
          where:{vehiclebookingId: rvwData.vehiclebookingId},
          defaults: rvwData
        });
        return{
          success: true,
          message: 'reviewed__successfully.',
          status: 200,
          resp,
        }
      } catch (err) {
        console.log(err);
      }
    },
    
    uploadImage: async(__, {image}, context) => {
      try {
        await context.models.VehicleImages.create(image);
        return{
          success: true,
          status: 200
        }      
      } catch (err) {
        console.log(err)
      }
    },

    addBookmark: async (__, {vehicle}, context) =>{
      try {
        await context.models.Bookmark.create(vehicle);
        return{
          success: true,
          vehicle,
          status: 200
        }
      } catch (err) {
        console.log(err)
      }
      return {
        success: true,
        message: 'Bookmark added',
        obj
      }
    },
    setPrice: async (__, obj, context) =>{
      checkAuthAndResolve(context);
      try {
        const {price, vehicleId} = obj;
        const [, affectedRows] = await context.models.Vehicle.update({
          price: price,
        }, {
          where: {id: vehicleId}, 
          returning: true, 
          plain: true,
        });
        if (affectedRows){
          return{
            success: true,
            obj,
            status: 200
          }
        }
      } catch (err) {
        return{errors: formatErrors(err, context.models),}
      }
    },

    setWithDriver: async (__, { vehicleId, with_driver }, context, _) =>{
      checkAuthAndResolve(context);
      try {
        const [, affectedRows] = await context.models.Vehicle.update({
          with_driver: with_driver,
        }, {
          where: {id: vehicleId}, 
          returning: true,
        });
        if (affectedRows){
          return{
            success: true,
            status: 200
          }
        }
      } catch (err) {
        return{errors: formatErrors(err, context.models),}
      }
    },

    updateVehicleInfo: async(__, {vehicleId, updateData}, context) => {
      checkAuthAndResolve(context);
      try {
        const [] = await context.models.Vehicle.update(updateData, {
          where: {id: vehicleId},
          returning: true, // needed for affectedRows to be populated
          plain: true // makes sure that the returned instances are just plain objects
        });
        return{
          success: true,
          status: 200,
        }    
      } catch (err) {
        return{
          errors: formatErrors(err, context.models),
        }
      }
    },

    updateBasicDetails: async(__, {input, vehicleId}, context) => {
      checkAuthAndResolve(context);
      const data = { 
        vehicleId: parseInt(vehicleId),
        carName: input.carName,
        seats: parseInt(input.seats),
        doors: parseInt(input.doors),
        fuelType: input.value,
        grade:input.grade,
      }
      const updata = { 
        carName: input.carName,
        seats: parseInt(input.seats),
        doors: parseInt(input.doors),
        fuelType: input.value,
        grade:input.grade,
      }
      const [] = await context.models.Vehicle.update({
        numberPlate: input.plateNumber,
        carDetails: input.description,
        features: input.features,
      }, {
        where: {id: vehicleId}, 
        returning: true, 
        plain: true,
      });
      return await Check_Id(context.models.BasicVehicleDetails, vehicleId).then(id => {
        if (id) {
          try {
            context.models.BasicVehicleDetails.create(data);
            context.models.VehicleGuideline.create({guideline: input.guidelines,vehicleId: parseInt(vehicleId)});
            return{
              success: true,
              status: 200
            }
          } catch (er) {
            console.log(er)
          }
        }else{
          try {
            context.models.BasicVehicleDetails.update(updata, {where: {vehicleId: data.vehicleId}});
            context.models.VehicleGuideline.update({guideline: input.guidelines}, {
              where: {vehicleId: data.vehicleId}
            });
            return{
              success: true,
              status: 200,
            }    
          } catch (err) {
            return{
              errors: formatErrors(err, context.models),
            }
          }
        }
      });
    },

    guestInstruction: async(__, {}, context) => {
      checkAuthAndResolve(context);
    },

    createVehicleAvailability: async (__, args, context) => {
      checkAuthAndResolve(context);
      try {
        const [, affectedRows] = await context.models.Vehicle.update({ 
          carAvailability: args.date,
        }, {
          where: {id: args.vehicleId},
          returning: true, // needed for affectedRows to be populated
          plain: true // makes sure that the returned instances are just plain objects
        });
        console.log(affectedRows);

        return{
          success: true,
          args,
          status: 200
        }      
      } catch (err) {
        console.log(err)
      }
    },

    pickUpDropOffLocation: async (__, obj, context, _) =>{
      checkAuthAndResolve(context);
      try {
        const [, affectedRows] = await context.models.Vehicle.update({ 
          pickUpDropOffLocation: obj.locationData,
        }, {
          where: {id: obj.vehicleId},
          returning: true, // needed for affectedRows to be populated
          plain: true // makes sure that the returned instances are just plain objects
        });

        return{
          success: true,
          ok: affectedRows,
          obj,
          status: 200
        }
      } catch (err) {
        return{errors: formatErrors(err, context.models),}
      }
    },

    mPesa: async (__, {senderMsisdn, amount}) =>{
      const accountRef = randmString(6);
      let msisdn = parseInt(senderMsisdn);
       const {data, status} = await stkPush(msisdn, amount, accountRef);
      return{
        data,
        accountRef: accountRef,
        status: status,
      }
    },

    bToCustomer: async (__, {msisdn, amount, rem, occ}) =>{
      const mpesaPhoneNumber = parseInt(msisdn);
      const {data, status} = await b2c(amount, mpesaPhoneNumber, rem, occ);
      return{
        data,
        status: status,
      }
    },

    deviceId: async (__, {deviceId}, context) => {
      const {data} = checkAuthAndResolve(context);
      try {
          const [] = await context.models.User.update({
            deviceId: deviceId
          }, {
            where: {id: data.id},
            returning: true, // needed for affectedRows to be populated
            plain: true // makes sure that the returned instances are just plain objects
          });
          return {
            success: true,
            message: "ok",
            status: 200
          };
      }catch (err) {
        console.log(err)
        return{errors: formatErrors(err, context.models)}
      }
    },
    sendPushNotifications: async(__, {input}, context, _) =>{
      checkAuthAndResolve(context);
      //get deviceid to send notifications to from db
      try {
        const deviceId = await context.models.User.findAll({
          attributes: ['deviceId'],
          where:{
            deviceId:{
              [Op.ne]: null
            }
          }
        });
        const message_notification = {
          notification: {
            "title": `${input.title}`,
            "body": `${input.message}`,
            "image": `${input.image}`
          }
        }
        // let tk = `dVchvjtCRSA:APA91bFj_2Rx536sp4XIRgMsKU-goS-OfGtplzCPFVdcsbv0ffRVfOoAdvGvHX60iGBEvhTUenKYiaT29CSIJARENizDChv58WEVKyPPYU_xxch8fTXzRbQjOpcdwb0Ds3TF42Pm5vl4`; 
        let tkns = [];
        deviceId.forEach(t => {
          const tokens = t.dataValues.deviceId;
          tkns.push(tokens);
        });
        sendPush(context, tkns, message_notification, options);
        return{
          success: true,
          message: "ok",
          status: 200
        }
        
      } catch (err) {
        console.log(err)
        return{errors: formatErrors(err, context.models)}
      }
    },

     uploadSingleFile: async (root, { file }) => {
      const { filename } = await file;
      console.log(filename)
      return{
        success: true,
        message: 'Ok',
      }
      // Now use stream to either write file at local disk or CDN
     },
     cancelleBooking: async (__, { input }, context, _) => {
      checkAuthAndResolve(context);
      try {
        await context.models.Cancelled_Booking.findOrCreate({
          where: { bookingId: input.bookingId },
          defaults: input,
        });
        return{
          success: true,
          message: 'Ok',
        }
      } catch (err) {
        console.log(err)
        return{errors: formatErrors(err, context.models)}
      }
     },

     rejecteBooking: async (__, {input}, context, _) => {
      checkAuthAndResolve(context);
      try {
        await context.models.Rejected_Booking.create(input);
        return{
          success: true,
          message: 'Ok',
        }
      } catch (err) {
        console.log(err)
        return{errors: formatErrors(err, context.models)}
      }
     },

     addAReview: async (__, {review}, ctx, _) => {
      const {data} = checkAuthAndResolve(ctx);
       try {
         await ctx.models.User_Rating.create({...review, by_user_id: data.id});
         return{
          message: "ok",
          status: 200
        }
       } catch (err) {
         console.log(err);
         return{
          message: `Error !!${err.message}`,
          status: 0,
        }
       }
     },
     

     /**
      * @name TransliteLif mutations
      * 
      */
     createCar: async (_, {input, driverImg}, ctx, __) => {
      const _notification = {
        notification: {
          "title": `Car Registration has been aproved.`,
          "body": `Your car, REG NO: ${input.number_plate} has been aproved, you can now offer a ride to passangers going your way and earn extra cash.`, //+ title,
          "image": `${input.img_url}`
        }
      };
      try {
        await models.User.update({
          avatorUrl: driverImg === '' ? null : driverImg,
        }, {
          where: {
            id: {
              [Op.eq]: input.user_id,
            }
          },
        });
        const user = await findUserById(input.user_id);
        sendPush(ctx, user.deviceId, _notification, options);
       return await models.Car.create(input);
      } catch (err) {
        throw err;
      }
     },
 
     createLift: async (_, {input, PickupDropoffLocations}, context, __) => {
      const {data} = checkAuthAndResolve(context);
      const _input = {
        ...input,
        user_id: data.id
      }
       try {
         const {dataValues} = await context.models.Trip.create(_input);

         const location_data = {
           trip_id: dataValues.id,
           ...PickupDropoffLocations,
         };

         await context.models.Location_point.create(location_data);
 
         return dataValues;
 
       } catch (err) {
         throw err;
       }
     },
 
     liftsBooking: async (_, {input}, context, __) => {
      const {data} = checkAuthAndResolve(context);
       try {
        const {dataValues: me} = await models.User.findByPk(data.id, {
          attributes: ['phone', 'email', 'deviceId', 'firstname'],
         });

         let seats = [];
         for (let i = 0; i < input.seats; i++) {
           seats.push(i);
         }

         const lift_data = {
          trip_id: input.trip_id,
          user_id: data.id,
          lift_owner_id: input.lift_owner_id,
          mPesa_code: input.mPesa_code,
          mPesaNumber: input.mPesaNumber,
          seats: JSON.stringify(seats),
          amount: input.amount,
          status: 'PEDDING',
          isCanceled: false,
         }

         const {dataValues: lift} = await models.Trip.findByPk(input.trip_id, {
          attributes: ['departure_time', 'from' , 'to'],
         });

          const {dataValues} = await models.User.findByPk(input.lift_owner_id, {
           attributes: ['phone', 'email', 'deviceId', 'firstname'],
          });

          const notification_data = {
            email: dataValues.email,
            sub: `New ride booking ${lift.from.name} → ${lift.to.name}, ${moment(lift.departure_time).format('MMM DD h:mm A')}`,
            name: dataValues.firstname,
            subMsg: 'Please Accept or Cancel on Translite App.',
            message: `${me.firstname}, Has book ${input.seats} seat Ksh${input.seats * input.amount}, route ${lift.from.name} → ${lift.to.name}, at ${moment(lift.departure_time).format('MMM DD h:mm A')}.`
          };
          await Queue.add(SendNotificationEmail.key, {...notification_data});
          return await context.models.Trips_booking.create(lift_data);
       } catch (err) {
         throw err;
       }
    },

    updateOrDelete: async (__, {action, id}, context, _) => {
      try {
        switch (action) {
          case 'delete':
            try {
              const resp = await context.models.Trip.destroy({
                where: {
                  id: {
                    [Op.eq]: id,
                  },
                },
              });
              return{
                status: resp,
              };
            } catch (err) {
              return{errors: formatErrors(err, context.models)}
            }
            break;
          case 'update' :

            break;
          //  default:

          //    break;
        }
      } catch (err) {
        
      }
    },

    cancelleAcceptLift: async (__, {action, booking_id}, ctx, _) => {
      switch (action) {
        case 'CANCELLED':
          try {
            const res =await ctx.models.Trips_booking.update({
              status: action,
              isCanceled: true,
            },{
              where: {
                id: {
                  [Op.eq]: booking_id
                }
              },
              returning: true,
              plain: true,
            });
            if (!res) return {status: 0};
            const data = res[1].dataValues;
            const user = await findUserById(data.user_id);
            const trip = await findLiftById(data.trip_id);
            return{
              status: 200,
            };
          } catch (error) {
            console.log(error);
          }
          break;
          case 'ACCEPTED':
            try {
              const res = await ctx.models.Trips_booking.update({
                status: action
              },{
                where: {
                  id: {
                    [Op.eq]: booking_id
                  }
                },
                returning: true,
                plain: true,
              });
              if (!res) return {status: 0};
              const data = res[1].dataValues;
              const user = await findUserById(data.user_id);
              const trip = await findLiftById(data.trip_id);
              return{
                status: 200,
              }
            } catch (error) {
              
            }
          break;
        default:
          break;
      }
    },

    sendNotificationEmail: async(__, {input}, _) => {
      try {
        await Queue.add(SendNotificationEmail.key, {
          ...input,
          subMsg: 'Please log on to your translite account on the app and start offering lift to passangers going your way.'
        });
        return{
          success: true,
          message: 'Ok',
        }
      } catch (err) {
        console.error(err);
      }
    },

    sendMessage: async(__, {msg}, ctx, _) => {
      const {data} = checkAuthAndResolve(ctx);
      const s_r = {
        receiver: msg.receiver,
        sender: data.id,
        lift_id: msg.lift_id,
      }
      let msg_thread_id;
      // check if there is conversation between the 2 users exists, if not create new thread
      const opt1 = await ctx.models.Messages_thread.count({
        where: {
          [Op.and]: [
            {sender: data.id},
            {receiver: msg.receiver},
            {lift_id: msg.lift_id}
          ],
        },
      });
      const opt2 = await ctx.models.Messages_thread.count({
        where: {
          [Op.and]: [
            {receiver: data.id},
            {sender: msg.receiver},
            {lift_id: msg.lift_id}
          ],
        },
      });

      if (opt1 === 0 && opt2 === 0) {
        const {dataValues} = await ctx.models.Messages_thread.create(s_r);
        msg_thread_id = dataValues.msg_thread_id;
      }
      const res1 = await ctx.models.Messages_thread.findOne({
        where: {
          [Op.and]: [
            {receiver: data.id},
            {sender: msg.receiver},
            {lift_id: msg.lift_id}
          ],
        },
      });
      const res2 = await ctx.models.Messages_thread.findOne({
        where: {
          [Op.and]: [
            {sender: data.id},
            {receiver: msg.receiver},
            {lift_id: msg.lift_id}
          ],
        },
      });
      if (res1 !== null ) {
        msg_thread_id = res1.dataValues.msg_thread_id;
      }
      if (res2 !== null ) {
        msg_thread_id = res2.dataValues.msg_thread_id;
      }
      try {
        const result = await ctx.models.Message.create({
          ...s_r, 
          msg_thread_id, 
          msg_body: msg.msg_body, 
          isRead: false,
          isFlaged: false,
          isReplied: false
        });

        let sender_cache_key = `sender_key:${s_r.sender}`;
        let lift_cache_key = `lift_id_key:${s_r.lift_id}`;
      
        const user_cached = await cache.get(sender_cache_key);
        const lift_cached = await cache.get(lift_cache_key);

        if (user_cached && lift_cached) {
          const message_data = {
            ...result.dataValues,
            User: {...user_cached},
            Trip: {...lift_cached},
          }
          _publish(EVENTS.ON__NEW_MESSAGE, message_data);
          _publish(EVENTS.ON__NEW_CHAT, message_data);
          return{
            status: 200,
            message: result.dataValues.msg_thread_id,
          }
        }

        const user = await ctx.models.User.findByPk(s_r.sender);
        const lift = await ctx.models.Trip.findByPk(s_r.lift_id);

        await cache.set(sender_cache_key, user, 10);
        await cache.set(lift_cache_key, lift, 10);

        const message_data = {
          ...result.dataValues,
          User: {...user.dataValues},
          Trip: {...lift.dataValues},
        }
        _publish(EVENTS.ON__NEW_MESSAGE, message_data);
        _publish(EVENTS.ON__NEW_CHAT, message_data);
        return{
          status: 200,
          message: result.dataValues.msg_thread_id,
        }
      } catch (err) {
        console.error(err);
        return{
          status: 0,
          message: err.message,
        }
      }
    },

    updateAppVersion: async (__,  {input}, ctx, _) => {
      checkAuthAndResolve(ctx);
      const result = await ctx.models.App_version.create({...input});
      try {
        return{
          status: 200,
          message: result.dataValues.versionCode,
        }
      } catch (err) {
        console.error(err);
        return{
          status: 0,
          message: err.message,
        }
      }
    },

  },

//Subscriptions
Subscription: {
  onBooking: {
    subscribe: withFilter(() => pubsub.asyncIterator([EVENTS.ON__NEW_BOOKING]), 
    (payload, variables) => {
      return payload.onBooking.ownerId === variables.id;
    }),
  },
  onNewuser:{
    subscribe: () => pubsub.asyncIterator([EVENTS.ON__NEW_USER]),
  },
  onNewmessage: {
    subscribe: withFilter(() => pubsub.asyncIterator([EVENTS.ON__NEW_MESSAGE]), 
    (payload, varl) => {
      if (payload.onNewmessage.receiver === parseInt(varl.user_id)) {
        return true;
      }
      if (payload.onNewmessage.sender === parseInt(varl.user_id)) {
        return true;
      }
    }),
  },
  onNewChat: {
    subscribe: withFilter(() => pubsub.asyncIterator([EVENTS.ON__NEW_CHAT]),
    (payload, variables) => {
      return payload.onNewChat.msg_thread_id  === variables.msg_thread_id
    }),
  }
},
  

};

module.exports = resolvers;
// '{"query":"mutation file($file: Upload!){\n  uploadSingleFile(file: $file){\n    success\n  }\n}"}'