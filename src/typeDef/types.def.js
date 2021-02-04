const { gql } = require('apollo-server-express');

const typeDef = gql`
scalar Upload
scalar JSON
scalar DateTime
enum idType {
  PASSPORT
  IDCARD
}
enum recomended {
  YES
  NO
}
enum bookedLiftStatus {
  CANCELLED
  ACCEPTED
  PEDDING
}
    type User {
        id: ID!
        firstname: String 
        lastName: String
        email: String  
        uuid: String 
        phone: String
        address: String 
        lat: Float
        long: Float
        active: Boolean
        avatorUrl: String
        createdAt: DateTime
        deviceId: String
        User_Ratings: [getUserReviews]
    }
    type Basiccardetails {
      carName: String
      seats: Int
      doors: Int
      value: String
      grade: String
    }

    type Guidelines {
       guidelines: String
    }
    type Vehicle {
        id: ID!
        userId: Int
        vuuid: String
        lat: Float!
        lng: Float!
        model: String
        year: String
        make: String
        features: JSON
        vehicleType: String
        carAvailability: JSON
        transmission: String
        VehicleImages: [VehicleImages]!
        price: Int
        # VehicleAvailabilties: [vehicleAvailabilty]
        carDetails: String
        millage: String
        numberPlate: String
        pickUpDropOffLocation: JSON
        User: User!
        Reviews: [Reviews]
        # Bookings: [Bookings!]!
        with_driver: Boolean
        Vehiclebookings: [BookingHistory]
        BasicVehicleDetail: JSON
        VehicleGuideline: JSON
    }

    input addVehicle {
        features: JSON
        checked: Boolean
        loactionName: String
        vuuid: String
        model: String!
        year: String!
        make: String!
        vehicleType: String!
        transmission: String!
        price: Int!
        lat: Float!
        lng: Float!
        carDetails: String!
        millage: String!
        numberPlate: String!
        imgUrl: String!
    }

    type Bookings {
        tripStart: String
        tripEnd: String
        amntPerday: Int
        pickUpDropOffLocation: JSON
        totalAmnt: Int
    }

    input bookings {
        vehicleId: Int!
        userId: Int!
        tripStart: String!
        tripEnd: String!
        amntPerday: Int!
        totalAmnt: Int!
    }

    input createReview {
        review: String!
        vehiclebookingId: Int!
        rate: Int!
        vehicleId: Int!
    }

    input Booking{
        tripStart: String!
        tripEnd: String!
        mPesaNumber: String!
        days: Float!
        vehicleId: Int!
        ownerId: Int!
        picRetLo: JSON
        vehicleData: JSON
        mpesaReceiptNumber: String!
        isActive: Boolean!
    }

    input uploadImage{
        imgUrl: String!
        vehicleId: Int!
    }

    type VehicleImages {
        vehicleId: Int
        imgUrl: String
    }

    type Reviews {
        createdAt: DateTime
        review: String
        rate: Int
        userId:Int
        User: User!
    }

    input CreateNewUser {
        firstname: String! 
        lastName: String!
        email: String! 
        pass: String 
        uuid: String 
        phone: String! 
        address: String! 
        lat: Float
        long: Float
        active: Boolean
        avatorUrl: String
    }

    input updateUser{
        firstname: String! 
        lastName: String!
        email: String! 
        phone: String! 
        address: String!
        avatorUrl: String
    }

    input updateVehicleInfo {
        make: String!
        model: String!
        year: String!
        transmission: String!
        millage: String!
        vehicleType: String!
     }

     input updateBasicDetails {
      carName: String
      plateNumber: String!
      description: String!
      guidelines: String
      seats: Int
      doors: Int
      value: String
      grade: String
      features: JSON!
     }

     input guestInstruction {
      guestInstruction: String
      welcomeMessage: String
      carGuide: String
     }

    type Response {
        success: Boolean
        message: String
        status: Int
    }

    type MpesaResponse {
        data: JSON
        status: Int
        accountRef: String
    }
    type ListVehicleResponse {
        success: Boolean!
        vehicle: Vehicle!
    }
    type CreateUserResponse{
        user: User!
        token: String!
    }
    type vehicleAvailabilty {
        date: DateTime   
    }

    type Bookmark{
        userId: String
        vehicleId: String
    }
    input addBookmark {
        userId: String!
        vehicleId: String!
    }

    type S3Payload {
        signedRequest: String!,
        url: String!,
    }

   type PaymentConfirmed {
     paymentType: String
     mpesaReceiptNumber: String
     amount: Int
     phoneNumber: String
     transactionDate: String
     status: Boolean
    }

    type CancelledBooking{
        bookingId: Int
        isCancelled: Boolean
    }
    type RejectedBooking{
        bookingId: Int
        isRejected: Boolean
    }

    type BookingHistory{
        tripStart: String
        tripEnd: String
        days: Float!
        id: ID!
        mPesaNumber: String
        picRetLo: JSON
        vehicleData: JSON
        mpesaReceiptNumber: String!
        userId: Int
        isActive: Boolean
        pending: Boolean
        createdAt: DateTime!
        User: User!
        Cancelled_Booking: CancelledBooking
        Rejected_Booking: RejectedBooking
    }

    type Newbooking{
        id: ID!
        tripStart: String
        tripEnd: String
        mPesaNumber: String
        days: Int
        pending: Boolean
        isActive: Boolean
        bookingId: Int
        mpesaReceiptNumber: String
        userId: Int
        vehicleId: Int
        createdAt: String
        updatedAt: String
    }

    input CancelleBooking{
    bookingId: Int!,
    isCancelled: Boolean!
    }

    input RejecteBooking{
    bookingId: Int!
    isRejected: Boolean!
    }

    input fcmNotification {
        title: String!
        message: String!
        image: String
    }

    type bookingResponse{
        success: Boolean!
        message: String
        status: Int
        vehicleBooked: Newbooking!
    }

    type TripPricing {
        Totalpdy: Int
        Total: Int
        BookingFeepdy: Int
        TotalBookingFee: Int
        PayableAmount: Int
    }

input docs {
  id_number: String
  insurance_stiker_url: String
  driving_licence_number: String
  user_photo_url: String
  isVerified: Boolean
  iDtype: idType
  user_id: ID
}

type verified_documents{
  id_number: String
  insurance_stiker_url: String
  driving_licence_number: String
  user_photo_url: String
  isVerified: Boolean
  iDtype: idType
  user_id: ID
}

# Translite lifts types 

input CreateCar {
  user_id: ID!
  make: String!
  model: String!
  year: Int!
  number_plate: String!
  img_url: String!
  color: String!
}

type GetCar {
  id: ID!
  make: String
  model: String
  year: Int
  number_plate: String
  img_url: String
  createdAt: DateTime!
}

input CreateLift {
  car_id: ID!
  from: JSON
  to: JSON
  departure_time: String!
  amount_per_seat: Int!
  seats: Int!
  trip_note: String
  stop_over: JSON
  liftRules: JSON
}

input LiftsBooking {
  seats: Int!
  mPesa_code: String!
  amount: Int!
  mPesaNumber: String!
  trip_id: Int!
  lift_owner_id: Int!
}

type Lift{
  id: ID
  from: JSON
  to: JSON
  departure_time: DateTime
  amount_per_seat: Int
  seats: Int
  trip_note: String
  stop_over: JSON 
  user_id: Int
}

type BookedLifts {
  seats: JSON
  mPesa_code: String
  amount: Int
  mPesaNumber: String
  isCanceled: Boolean
  status: bookedLiftStatus
  id: ID!
  Trip: Lift
  user_id: Int
  User: User
}

type  userBookedLifts {
  User: User
  Car: GetCar
  Trips_booking: BookedLifts 
}

input locationPoints {
  pickup_location: JSON
  dropoff_location: JSON
}

type PickupDropOffPoints {
  pickup_location: JSON
  dropoff_location: JSON
}


type LiftsBookingResponce {
  id: ID
  user_id: ID
  msg: String
}

type GetLifts {
  id: ID!
  from: JSON
  to: JSON
  departure_time: DateTime
  createdAt: DateTime!
  amount_per_seat: Int!
  seats: Int!
  trip_note: String
  stop_over: JSON
  Car: GetCar!
  Location_point: PickupDropOffPoints
  User: User!
  Trips_bookings: [BookedLifts]
  passangers: JSON
  bookedSeats: Int
  liftRules: JSON
}

# Mails
input mailNtf {
  name: String!
  email: String!
  message: String!
  sub: String! 
} 

input addReview {
  to_user_id: Int
  stars: Int
  review: String
  recomended: recomended
  evaluation: String
  lift_id: Int
}


type getUserReviews{
  id: ID!
  by_user_id: ID
  to_user_id: ID
  stars: Int
  review: String
  recomended: String
  evaluation: String
  createdAt: DateTime
  lift_id: Int
  ratedBy: User
}

type userObj {
  id: ID!
  firstname: String 
  lastName: String
  email: String
  phone: String
  active: Boolean
  avatorUrl: String
  createdAt: DateTime
  deviceId: String
  Trips: [Lift]
  User_Ratings: [getUserReviews]
  Verified_document: verified_documents
}

input message {
  sender: Int
  receiver: Int
  msg_thread_id: String
  msg_body: String
  isRead: Boolean
  lift_id: Int
  isFlaged: Boolean
  isReplied: Boolean
  createdAt: DateTime
}

type messagesList {
  id: ID!
  sender: Int
  receiver: Int
  _id: Int
  msg_thread_id: String
  msg_body: String
  createdAt: DateTime
  isRead: Boolean
  isFlaged: Boolean
  isReplied: Boolean
  Trip: Lift
  User: User
}

type getAppV {
  versionCode: String!
  versionName: String!
}

input appV {
  versionCode: String!
  versionName: String!
}

# union MessagesResultList = messagesList | Response

type Query {
  getAppVersion: [getAppV!]
  vehicleById(id: ID!): Vehicle
  searchByLocation(l: String!): [Vehicle]
  users: [User!]!
  me: User!
  getUser(id: ID!): userObj!
  userVehicles: [Vehicle]
  getAllVehicles(latitude: Float!, longitude: Float!): [Vehicle]
  checkPayments(crID: String!, mrID: String!): PaymentConfirmed
  bookingHistory: [BookingHistory]!
  bookingHistoryById(id: ID!): BookingHistory!
  vehicleTrips(id: ID!): [BookingHistory!]!
  tripPricing(price: Int!, days: Float): TripPricing!
  mpesaReceiptNumber(mpesaCode: String!): PaymentConfirmed
  # Translite lift
  getAllLifts: [GetLifts]
  offeredLiftById: [GetLifts]
  liftById(liftId: ID!): GetLifts
  getCarToOfferLift: [GetCar]
  myBookedLift: [userBookedLifts!]
  getMessagesList: [messagesList!]
  messageChat(msg_thread_id: String!): [messagesList!]
  userReviews(id: Int!): [getUserReviews!]
  getNewLiftBookings: [BookedLifts]
}


type Mutation {
  deviceId(deviceId: String!): Response!
  sendPushNotifications(input: fcmNotification!): Response! 
  mPesa(senderMsisdn: String!, amount: Int!): MpesaResponse!
  bToCustomer(msisdn: String!, amount: Int!, rem: String!, occ: String): MpesaResponse!
  uploadSingleFile(file: Upload!): Response!
  pickUpDropOffLocation(locationData: JSON!, vehicleId: Int!): Response!
  signS3(filename: String!, filetype: String!): S3Payload!
  updateUser(input: updateUser!): Response!
  addBookmark(vehicle: addBookmark): Response
  setPrice(vehicleId: Int!, price: Int!): Response!
  setWithDriver(vehicleId: Int!, with_driver: Boolean!): Response!
  updateVehicleInfo(updateData: updateVehicleInfo!, vehicleId: Int!): Response!
  updateBasicDetails(input: updateBasicDetails!, vehicleId: Int!): Response!
  guestInstruction(input: guestInstruction!, vehicleId: Int!): Response!
  createVehicleAvailability(date: JSON!, vehicleId: Int!): Response!
  uploadImage(image: uploadImage): Response!
  createReview(review: createReview!): Response!
  createUser(input: CreateNewUser): CreateUserResponse!
  listVehicle(input: addVehicle): ListVehicleResponse!
  bookings(bookingData: bookings): Response!
  handleBooking(bookingData: Booking!): bookingResponse!
  cancelleBooking(input: CancelleBooking!): Response!
  rejecteBooking(input: RejecteBooking!): Response!
  addAReview(review: addReview!): Response!
  addVerificatonDocs(input: docs!): Response
  #   Translite lifts
  createCar(input: CreateCar!, driverImg: String): GetCar!
  createLift(input: CreateLift!, PickupDropoffLocations: locationPoints!): GetLifts!
  liftsBooking(input: LiftsBooking!): LiftsBookingResponce!
  updateOrDelete(action: String!, id: ID!): Response!
  cancelleAcceptLift(action: bookedLiftStatus!, booking_id: ID!): Response!

  # Mail 
  sendNotificationEmail(input: mailNtf): Response!

  # Messages
  sendMessage(msg: message!): Response!

  #update app versions
  updateAppVersion(input: appV!): Response!
}
type Subscription{
  onBooking(id: Int!): Newbooking!
  onNewuser: User!
  onNewmessage(user_id: ID!): messagesList
  onNewChat(msg_thread_id: String!): messagesList
}
schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}

`;
module.exports= typeDef;