FROM node:14

WORKDIR /
RUN apt-get update
RUN apt-get install wait-for-it
RUN npm install yarn
COPY yarn.lock .
COPY package.json .
RUN yarn install
COPY . .
CMD yarn db:docker && yarn start