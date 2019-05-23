const { ApolloServer, gql } = require('apollo-server');

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    address: String
  }

  type Query {
    user(id: ID!): User
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
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen(4002).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
