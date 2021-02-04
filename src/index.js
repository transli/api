require('./bootstrap');
const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');
// const url = require('url');
// const DataLoader = require('dataloader');
const { ApolloServer } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');
const jwt = require('jsonwebtoken');
const crone = require('node-cron');
const sendGrid = require('@sendgrid/mail');

const typeDefs_h = require('./typeDef/types.def');
const resolvers_h = require('./resolvers/resolver');
const models = require('./models');
const {admin} = require('./pushFCM/pushNofication');
const smsClient = require('./sms/Africastalking');
const api = require('./api');

const testCrone = require('./cronejobs/crone');

crone.schedule('05 08 * * 1', async function () {
  await testCrone();
}, {
  scheduled: true,
  timezone: 'Africa/Nairobi',
});

const PORT = parseInt(process.env.PORT);
// const dtLoader = new DataLoader();

const app = express();

// sendGrid.setApiKey(process.env.SENDGRID_API_KEY);


// const msg = {
//   to: ['sityf237@gmail.com', 'biz.john@yahoo.com', 'translite9@gmail.com', 'parrotguest@gmail.com', 'sunplus.spp48@gmail.com', 'translitecarsharing@gmail.com', 'bizz.joh@yahoo.com'], // replace these with your email addresses
//   from: 'John Ngugi <john@translite.app>',
//   subject: '🍩 Donuts, at the big donut 🍩',
//   text: 'Fresh donuts are out of the oven. Get them while they’re hot!',
//   html: '<p>Not fresh donuts are out of the oven. Get them while they’re <em>hot!</em></p>',
// };
// sendGrid.send(msg).then((d)=>{
//   console.log('emails sent!!', d);
// }).catch((err) =>{
//   console.log(err);
// });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("trust proxy", 1);
  app.use(
    cors({
      // origin: process.env.CORS_ORIGIN,
      credentials: true,
    })
  );
app.use('/api/rest', api);

const _validateToken = (token) => {
  const decoded = jwt.verify(
    token.replace('Bearer ', ''),
    process.env.JWT_SECRET_KEY
  );
  return decoded;
};

const schema = makeExecutableSchema({
  typeDefs: [typeDefs_h],
  resolvers: [resolvers_h]
});

const server = new ApolloServer({
  schema,
  context: ({req, connection, res}) => {
    if (connection){
      return{
        models,
        smsClient,
        // dtLoader,
        res,
      };
    }
    if (req) {
      return{
        models,
        headers: req.headers,
        admin,
        smsClient,
        res
        // dtLoader,
      };
    }
  },
  subscriptions:{
    onConnect: (connectionParams, webSocket, __)=>{
    if (connectionParams.Authorization, webSocket) {
      const {data} = _validateToken(connectionParams.Authorization);
      return{
        ...data
      }
    }
    throw new Error('Missing auth token!');
    },
  formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace('SequelizeValidationError: ', '')
      .replace('Validation error: ', '');
      return {
        ...error,
        message,
      };
    },
  },
  introspection: process.env.NODE_ENV === 'development' ? true : true,
  playground: process.env.NODE_ENV === 'development' ? true : true,
});

server.applyMiddleware({
  app,
  path: `/api/v10`,
  cors: false,
});

const httpServer = http.createServer(app);

server.installSubscriptionHandlers(httpServer);

httpServer.listen({port: PORT}, async() => { 
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  // console.log('server started');
  console.log(`🚀 Subscriptions ready at ws://localhost:${PORT}${server.subscriptionsPath}`);
});
