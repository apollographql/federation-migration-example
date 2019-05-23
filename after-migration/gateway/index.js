const { ApolloServer } = require('apollo-server');
const { ApolloGateway } = require('@apollo/gateway');

const serviceList = [
  { name: 'Reservations', url: 'http://localhost:4001' },
  { name: 'Users', url: 'http://localhost:4002' },
];

const gateway = new ApolloGateway({
  serviceList,
});

(async () => {
  const { schema, executor } = await gateway.load();

  const server = new ApolloServer({
    schema,
    executor,
  });

  server.listen(8080).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
})();
