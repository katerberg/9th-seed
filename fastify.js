const fastifyRoutes = require('./src/http/routes');
const fastify = require('fastify')({logger: true});


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
