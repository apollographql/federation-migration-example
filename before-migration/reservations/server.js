const { ApolloServer, gql } = require('apollo-server');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type Reservation {
    id: ID!
    userId: ID!
    reservationDate: String!
    status: String
  }

  type Query {
    reservations: [Reservation]!
    reservation(id: ID!): Reservation
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
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen(4001).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
