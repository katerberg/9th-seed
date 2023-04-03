FROM node:18

WORKDIR /usr/app
RUN apt-get update
RUN apt-get install wait-for-it
RUN npm install yarn
RUN rm package-lock.json
COPY yarn.lock .
COPY package.json .
RUN yarn install
COPY . .
CMD yarn db:docker && yarn http
