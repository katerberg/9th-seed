const {onChat, say} = require('./src/tmiClient');
const {getModResponse} = require('./src/messages/modMessages');
const {getUnpermissionedResponse} = require('./src/messages/unpermissionedMessages');
const fastifyRoutes = require('./src/http/routes');
const fastify = require('fastify')({logger: true});

onChat((_channel, user, message, self) => {
  try {
    if (self) {
      return;
    }

    say(getModResponse(message, user));
    say(getUnpermissionedResponse(message, user));
  } catch (e) {
    console.log(e);
    console.error('Something went wrong trying to parse the message'); // eslint-disable-line no-console
    console.log(e.message); // eslint-disable-line no-console
  }
});

Object.entries(fastifyRoutes.get).forEach(([name, route]) => {
  fastify.get(name, route);
});

// Run the server!
const start = async() => {
  try {
    await fastify.listen(3000);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
