FROM node:24.22.1

WORKDIR /usr/app
RUN apt-get update
RUN apt-get install wait-for-it
COPY package-lock.json .
COPY package.json .
RUN npm install
COPY . .
# DB seeding runs once per deploy in deploy-cloud.sh, not on every container start
CMD ["node", "fastify.js"]
