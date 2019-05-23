const { HttpLink } = require('apollo-link-http');
const { setContext } = require('apollo-link-context');
const { omit } = require("lodash");
const fetch = require('node-fetch');
const { introspectSchema, makeRemoteExecutableSchema, mergeSchemas } = require('graphql-tools'); 

const headerLink = setContext((_, previousContext) => {
  if (!previousContext || !previousContext.graphqlContext) return {};
  return {
    // some of the headers glitch uses will cause an error if forwarded because it gets in 
    // an infinite routing loop. If you don't have this problem, you could do the below
    // headers: previousContext.graphqlContext.headers,
    // this line shows how to omit specific headers as well if you need to
    // headers: omit(previousContext.graphqlContext.headers, ['connection', 'referer', 'x-glitch-routing']),
    headers : {
      'x-amzn-trace-id': previousContext.graphqlContext.headers['x-amzn-trace-id']
    }
  };

})
const reservationLink = headerLink.concat(new HttpLink({ uri: 'https://reservation-service.glitch.me/', fetch }));
const generateReservationSchema = async () => {
  const schema = await introspectSchema(reservationLink);
  const executableSchema = makeRemoteExecutableSchema({
    schema,
    link: reservationLink,
  });
  return executableSchema
}

const userLink = new HttpLink({ uri: 'https://users-service.glitch.me/', fetch });
const generateUserSchema = async () => {
  const schema = await introspectSchema(userLink);
  const executableSchema = makeRemoteExecutableSchema({
    schema,
    link: userLink,
  });
  return executableSchema
}

const linkTypeDefs = `
  extend type Reservation {
    user: User
  }
`

const generateAndMergeSchemas = async () => {
  const resSchema = await generateReservationSchema()
  const userSchema = await generateUserSchema()
  
  return mergeSchemas({
    schemas:[
      resSchema, userSchema, linkTypeDefs
    ],
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
          }
        }
      }
    }
  });
}

module.exports = generateAndMergeSchemas;