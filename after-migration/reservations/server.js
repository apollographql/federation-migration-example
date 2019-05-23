const { ApolloServer, gql } = require('apollo-server');
const { buildFederatedSchema } = require('@apollo/federation');

const typeDefs = gql`
  type Reservation @key(fields: "id") {
    id: ID!
    userId: ID!
    reservationDate: String!
    status: String
  }

  type Query {
    reservations: [Reservation]!
    reservation(id: ID!): Reservation
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    reservations: [Reservation]
  }
`;

const lookupReservation = () => {
  return {
    id: 1,
    userId: 1,
    reservationDate: 'today',
    status: 'good',
  };
};

const resolvers = {
  Query: {
    reservations: () => [lookupReservation(), lookupReservation()],
    reservation: () => lookupReservation(),
  },
  User: {
    reservations: () => [lookupReservation()],
  },
  Reservation: {
    __resolveReference: obj => lookupReservation(),
    userId: res => {
      console.log(res);
      return res.userId;
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

server.listen(4001).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
