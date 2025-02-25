const fs = require('fs');
const fastifyRoutes = require('./src/http/routes');

const isDev = process.env.ENV === 'development';
const httpsOptions = {
  key: fs.readFileSync(process.env.KEY || 'creds/fastify.key'),
  cert: fs.readFileSync(process.env.CERT || 'creds/fastify.crt'),
};

const fastify = require('fastify')({
  logger: true,
  https: isDev ? null : httpsOptions,
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
