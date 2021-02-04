FROM node:14

WORKDIR /src/translite/api

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .
COPY .env.production .env

# RUN yarn build

ENV NODE_ENV production

EXPOSE 8080
CMD [ "node", "src/index.js" ]
USER node