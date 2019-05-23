const { ApolloServer, gql } = require('apollo-server');
const { visit } = require('graphql');
const { HttpLink } = require('apollo-link-http');
const { setContext } = require('apollo-link-context');
const { omit } = require('lodash');
const fetch = require('node-fetch');
const {
  introspectSchema,
  makeRemoteExecutableSchema,
  mergeSchemas,
  transformSchema,
  visitSchema,
} = require('graphql-tools');

const reservationLink = new HttpLink({ uri: 'http://localhost:4001', fetch });

const generateReservationSchema = async () => {
  const schema = await introspectSchema(reservationLink);
  const executableSchema = makeRemoteExecutableSchema({
    schema,
    link: reservationLink,
  });
  return executableSchema;
};

const userLink = new HttpLink({ uri: 'http://localhost:4002', fetch });
const generateUserSchema = async () => {
  const schema = await introspectSchema(userLink);
  const executableSchema = makeRemoteExecutableSchema({
    schema,
    link: userLink,
  });
  return executableSchema;
};

const extendedReservationSchema = `
  extend type Reservation {
    user: User
  }
`;

const generateAndMergeSchemas = async () => {
  const reservationSchema = await generateReservationSchema();
  const userSchema = await generateUserSchema();

  return mergeSchemas({
    schemas: [reservationSchema, userSchema, extendedReservationSchema],
    resolvers: {
      Reservation: {
        user: {
          fragment: `... on Reservation { userId }`,
          resolve: (parent, args, context, info) => {
            return info.mergeInfo.delegateToSchema({
              schema: userSchema,
              operation: 'query',
              fieldName: 'user',
              args: {
                id: parent.userId,
              },
              context,
              info,
            });
          },
        },
      },
    },
  });
};

generateAndMergeSchemas().then(schema => {
  const server = new ApolloServer({
    schema,
    context: ({ req }) => ({ headers: req.headers }),
  });

  server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
  });
});
