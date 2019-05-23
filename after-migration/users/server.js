const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type User @key(fields: "id") {
    id: ID!
    firstName: String!
    lastName: String!
    address: String
  }

  type Query {
    user(id: ID!): User
  }

  # This was originally in the stitched gateway
  extend type Reservation @key(fields: "id") {
    id: ID! @external
    userId: ID! @external
    user: User @requires(fields: "userId")
  }
`;

const lookupUser = () => ({
  id: 1,
  firstName: 'Jake',
  lastName: 'Dawkins',
  address: 'everywhere',
});

const resolvers = {
  Query: {
    user: () => lookupUser(),
  },
  User: {
    __resolveReference(object) {
      return lookupUser();
    },
  },
  Reservation: {
    user: ({ userId }) => {
      /**
       * The old stitched resolvers called the Query.user resolver to lookup
       * a user, but since we're in this service, we can just use whatever we
       * need to lookup a user.
       */
      return lookupUser(userId);
    },
  },
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers,
    },
  ]),
});

server.listen(4002).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
