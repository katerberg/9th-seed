const fastifyRoutes = require('./src/http/routes');

// TLS is terminated by Caddy
const fastify = require('fastify')({
  logger: true,
});

fastify.register(require('@fastify/cors'));

Object.entries(fastifyRoutes.get).forEach(([name, route]) => {
  fastify.get(name, route);
});
Object.entries(fastifyRoutes.post).forEach(([name, route]) => {
  fastify.post(name, route);
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen({
      port: process.env.FASTIFY_PORT || 3000,
      host: '0.0.0.0',
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();

// Let in-flight requests finish when docker-rollout stops the old container
process.on('SIGTERM', async () => {
  await fastify.close();
  process.exit(0);
});
