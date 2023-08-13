FROM node:18

WORKDIR /usr/app
RUN apt-get update
RUN apt-get install wait-for-it
COPY package-lock.json .
COPY package.json .
RUN npm install
COPY . .
CMD npm run db:docker && npm run http
